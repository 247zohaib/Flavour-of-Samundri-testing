from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_MIN = 60 * 12  # 12 hours

app = FastAPI(title="Flavors of Samundri API")
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


# -------------------- Models --------------------
class MenuItem(BaseModel):
    id: str
    name: str
    description: str
    price: int
    category: str
    image: Optional[str] = None
    featured: bool = False


class CartItem(BaseModel):
    id: str
    name: str
    price: int
    quantity: int


class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    order_type: str = "delivery"
    address: Optional[str] = ""
    notes: Optional[str] = ""
    items: List[CartItem]
    total: int


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    order_type: str = "delivery"
    address: Optional[str] = ""
    notes: Optional[str] = ""
    items: List[CartItem]
    total: int
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderStatusUpdate(BaseModel):
    status: str


class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    message: str


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = ""
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LoginPayload(BaseModel):
    email: str
    password: str


class AdminUser(BaseModel):
    id: str
    email: str
    name: str
    role: str = "admin"


# -------------------- Auth helpers --------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.admin_users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


# -------------------- Static Menu Data --------------------
MENU_DATA: List[dict] = [
    {"id": "m1", "name": "Chicken Biryani", "description": "Slow-cooked basmati layered with aromatic spices and tender chicken.", "price": 450, "category": "Main Course", "image": "https://images.unsplash.com/photo-1755090154731-6b4f221490c3?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": True},
    {"id": "m2", "name": "Beef Karahi", "description": "Sizzling beef cooked in tomato, ginger and green chillies, served hot.", "price": 850, "category": "Main Course", "image": "https://images.unsplash.com/photo-1646398123647-695431536f7c?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": True},
    {"id": "m3", "name": "Chicken Karahi", "description": "Punjabi-style karahi with bone-in chicken, fresh herbs and butter.", "price": 750, "category": "Main Course", "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": False},
    {"id": "m4", "name": "Daal Makhani", "description": "Black lentils simmered overnight with cream and home spices.", "price": 320, "category": "Main Course", "image": None, "featured": False},
    {"id": "m5", "name": "Aloo Palak", "description": "Soft potatoes nestled in spiced spinach gravy.", "price": 280, "category": "Main Course", "image": None, "featured": False},
    {"id": "b1", "name": "Aloo Paratha", "description": "Stuffed potato paratha pan-cooked in desi ghee.", "price": 120, "category": "Breads & Sides", "image": None, "featured": True},
    {"id": "b2", "name": "Garlic Naan", "description": "Tandoor-baked naan brushed with garlic butter.", "price": 90, "category": "Breads & Sides", "image": None, "featured": False},
    {"id": "b3", "name": "Roghni Roti", "description": "Soft, milk-rich roti dotted with sesame.", "price": 80, "category": "Breads & Sides", "image": None, "featured": False},
    {"id": "c1", "name": "Karak Doodh Patti", "description": "Strong milk tea brewed slowly the village way.", "price": 150, "category": "Chai & Coffee", "image": "https://images.unsplash.com/photo-1619581073186-5b4ae1b0caad?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": True},
    {"id": "c2", "name": "Kashmiri Chai", "description": "Pink salted tea topped with crushed pistachios.", "price": 220, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "c3", "name": "Adrak Chai", "description": "Classic ginger chai with cardamom warmth.", "price": 130, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "c4", "name": "Rustic Espresso", "description": "Bold double-shot espresso, ground fresh daily.", "price": 250, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "c5", "name": "Cafe Latte", "description": "Smooth espresso with steamed milk and a chalk-art top.", "price": 320, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "d1", "name": "Gajar Halwa", "description": "Carrot halwa slow-cooked with milk, ghee and dry fruits.", "price": 280, "category": "Desserts", "image": None, "featured": True},
    {"id": "d2", "name": "Kheer", "description": "Creamy rice pudding kissed with saffron and cardamom.", "price": 220, "category": "Desserts", "image": None, "featured": False},
    {"id": "d3", "name": "Gulab Jamun (2 pcs)", "description": "Warm syrup-soaked dumplings, melt-in-mouth soft.", "price": 180, "category": "Desserts", "image": None, "featured": False},
    {"id": "r1", "name": "Sweet Lassi", "description": "Whipped yogurt blended with sugar and a hint of rose.", "price": 180, "category": "Refreshers", "image": None, "featured": False},
    {"id": "r2", "name": "Salted Lassi", "description": "Cooling savory lassi with cumin and mint.", "price": 180, "category": "Refreshers", "image": None, "featured": False},
    {"id": "r3", "name": "Rooh Afza Milk", "description": "Chilled milk swirled with rooh afza syrup.", "price": 160, "category": "Refreshers", "image": None, "featured": False},
]


VALID_ORDER_STATUSES = {"pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup", "completed", "cancelled"}


# -------------------- Public Routes --------------------
@api_router.get("/")
async def root():
    return {"message": "Flavors of Samundri API", "status": "ok"}


@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu(category: Optional[str] = None, featured: Optional[bool] = None):
    items = MENU_DATA
    if category:
        items = [i for i in items if i["category"].lower() == category.lower()]
    if featured is not None:
        items = [i for i in items if i["featured"] == featured]
    return [MenuItem(**i) for i in items]


@api_router.get("/menu/categories", response_model=List[str])
async def get_menu_categories():
    seen = []
    for i in MENU_DATA:
        if i["category"] not in seen:
            seen.append(i["category"])
    return seen


@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    if payload.order_type not in ("delivery", "pickup"):
        raise HTTPException(status_code=400, detail="Invalid order_type")
    if payload.order_type == "delivery" and not (payload.address or "").strip():
        raise HTTPException(status_code=400, detail="Address required for delivery")
    order = Order(**payload.model_dump())
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)
    return order


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(payload: ContactMessageCreate):
    msg = ContactMessage(**payload.model_dump())
    doc = msg.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact_messages.insert_one(doc)
    return msg


# -------------------- Admin Auth --------------------
@admin_router.post("/login")
async def admin_login(payload: LoginPayload):
    email = (payload.email or "").strip().lower()
    user = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")},
    }


@admin_router.get("/me", response_model=AdminUser)
async def admin_me(current=Depends(get_current_admin)):
    return AdminUser(**current)


# -------------------- Admin Dashboard --------------------
@admin_router.get("/stats")
async def admin_stats(current=Depends(get_current_admin)):
    pipeline_total = [{"$group": {"_id": None, "revenue": {"$sum": "$total"}, "count": {"$sum": 1}}}]
    pipeline_status = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    today_iso = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    pipeline_today = [
        {"$match": {"created_at": {"$gte": today_iso}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total"}, "count": {"$sum": 1}}},
    ]

    total = await db.orders.aggregate(pipeline_total).to_list(1)
    by_status = await db.orders.aggregate(pipeline_status).to_list(50)
    today = await db.orders.aggregate(pipeline_today).to_list(1)
    unread_messages = await db.contact_messages.count_documents({"read": False})

    return {
        "total_revenue": (total[0]["revenue"] if total else 0),
        "total_orders": (total[0]["count"] if total else 0),
        "today_revenue": (today[0]["revenue"] if today else 0),
        "today_orders": (today[0]["count"] if today else 0),
        "by_status": {row["_id"]: row["count"] for row in by_status},
        "unread_messages": unread_messages,
    }


@admin_router.get("/orders", response_model=List[Order])
async def admin_list_orders(
    status: Optional[str] = None,
    limit: int = 200,
    current=Depends(get_current_admin),
):
    query = {}
    if status:
        query["status"] = status
    docs = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return [Order(**d) for d in docs]


@admin_router.patch("/orders/{order_id}", response_model=Order)
async def admin_update_order_status(order_id: str, payload: OrderStatusUpdate, current=Depends(get_current_admin)):
    if payload.status not in VALID_ORDER_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {sorted(VALID_ORDER_STATUSES)}")
    res = await db.orders.find_one_and_update(
        {"id": order_id},
        {"$set": {"status": payload.status}},
        return_document=True,
        projection={"_id": 0},
    )
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(res.get("created_at"), str):
        res["created_at"] = datetime.fromisoformat(res["created_at"])
    return Order(**res)


@admin_router.get("/messages", response_model=List[ContactMessage])
async def admin_list_messages(limit: int = 200, current=Depends(get_current_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
        d.setdefault("read", False)
    return [ContactMessage(**d) for d in docs]


@admin_router.patch("/messages/{message_id}/read")
async def admin_mark_message_read(message_id: str, current=Depends(get_current_admin)):
    res = await db.contact_messages.update_one({"id": message_id}, {"$set": {"read": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


# -------------------- Startup --------------------
@app.on_event("startup")
async def on_startup():
    # Indexes
    try:
        await db.admin_users.create_index("email", unique=True)
        await db.orders.create_index([("created_at", -1)])
        await db.contact_messages.create_index([("created_at", -1)])
    except Exception as e:
        logging.warning("Index creation issue: %s", e)

    # Seed admin user idempotently
    admin_email = (os.environ.get("ADMIN_EMAIL") or "").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD") or ""
    if not admin_email or not admin_password:
        logging.warning("ADMIN_EMAIL/ADMIN_PASSWORD missing; skipping admin seed")
        return
    existing = await db.admin_users.find_one({"email": admin_email})
    if existing is None:
        await db.admin_users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Owner",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logging.info("Seeded admin user: %s", admin_email)
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.admin_users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logging.info("Updated admin password for: %s", admin_email)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Mount routers
app.include_router(api_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
