from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Flavors of Samundri API")
api_router = APIRouter(prefix="/api")


# -------------------- Models --------------------
class MenuItem(BaseModel):
    id: str
    name: str
    description: str
    price: int  # in PKR
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
    address: str
    notes: Optional[str] = ""
    items: List[CartItem]
    total: int


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    address: str
    notes: Optional[str] = ""
    items: List[CartItem]
    total: int
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------- Static Menu Data --------------------
MENU_DATA: List[dict] = [
    # Main Course - Pakistani/Punjabi
    {"id": "m1", "name": "Chicken Biryani", "description": "Slow-cooked basmati layered with aromatic spices and tender chicken.", "price": 450, "category": "Main Course", "image": "https://images.unsplash.com/photo-1755090154731-6b4f221490c3?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": True},
    {"id": "m2", "name": "Beef Karahi", "description": "Sizzling beef cooked in tomato, ginger and green chillies, served hot.", "price": 850, "category": "Main Course", "image": "https://images.unsplash.com/photo-1646398123647-695431536f7c?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": True},
    {"id": "m3", "name": "Chicken Karahi", "description": "Punjabi-style karahi with bone-in chicken, fresh herbs and butter.", "price": 750, "category": "Main Course", "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": False},
    {"id": "m4", "name": "Daal Makhani", "description": "Black lentils simmered overnight with cream and home spices.", "price": 320, "category": "Main Course", "image": None, "featured": False},
    {"id": "m5", "name": "Aloo Palak", "description": "Soft potatoes nestled in spiced spinach gravy.", "price": 280, "category": "Main Course", "image": None, "featured": False},

    # Breads & Sides
    {"id": "b1", "name": "Aloo Paratha", "description": "Stuffed potato paratha pan-cooked in desi ghee.", "price": 120, "category": "Breads & Sides", "image": None, "featured": True},
    {"id": "b2", "name": "Garlic Naan", "description": "Tandoor-baked naan brushed with garlic butter.", "price": 90, "category": "Breads & Sides", "image": None, "featured": False},
    {"id": "b3", "name": "Roghni Roti", "description": "Soft, milk-rich roti dotted with sesame.", "price": 80, "category": "Breads & Sides", "image": None, "featured": False},

    # Chai & Coffee
    {"id": "c1", "name": "Karak Doodh Patti", "description": "Strong milk tea brewed slowly the village way.", "price": 150, "category": "Chai & Coffee", "image": "https://images.unsplash.com/photo-1619581073186-5b4ae1b0caad?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", "featured": True},
    {"id": "c2", "name": "Kashmiri Chai", "description": "Pink salted tea topped with crushed pistachios.", "price": 220, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "c3", "name": "Adrak Chai", "description": "Classic ginger chai with cardamom warmth.", "price": 130, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "c4", "name": "Rustic Espresso", "description": "Bold double-shot espresso, ground fresh daily.", "price": 250, "category": "Chai & Coffee", "image": None, "featured": False},
    {"id": "c5", "name": "Cafe Latte", "description": "Smooth espresso with steamed milk and a chalk-art top.", "price": 320, "category": "Chai & Coffee", "image": None, "featured": False},

    # Desserts
    {"id": "d1", "name": "Gajar Halwa", "description": "Carrot halwa slow-cooked with milk, ghee and dry fruits.", "price": 280, "category": "Desserts", "image": None, "featured": True},
    {"id": "d2", "name": "Kheer", "description": "Creamy rice pudding kissed with saffron and cardamom.", "price": 220, "category": "Desserts", "image": None, "featured": False},
    {"id": "d3", "name": "Gulab Jamun (2 pcs)", "description": "Warm syrup-soaked dumplings, melt-in-mouth soft.", "price": 180, "category": "Desserts", "image": None, "featured": False},

    # Refreshers
    {"id": "r1", "name": "Sweet Lassi", "description": "Whipped yogurt blended with sugar and a hint of rose.", "price": 180, "category": "Refreshers", "image": None, "featured": False},
    {"id": "r2", "name": "Salted Lassi", "description": "Cooling savory lassi with cumin and mint.", "price": 180, "category": "Refreshers", "image": None, "featured": False},
    {"id": "r3", "name": "Rooh Afza Milk", "description": "Chilled milk swirled with rooh afza syrup.", "price": 160, "category": "Refreshers", "image": None, "featured": False},
]


# -------------------- Routes --------------------
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
    order = Order(**payload.model_dump())
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders", response_model=List[Order])
async def list_orders():
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return [Order(**d) for d in docs]


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(payload: ContactMessageCreate):
    msg = ContactMessage(**payload.model_dump())
    doc = msg.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact_messages.insert_one(doc)
    return msg


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contact_messages():
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return [ContactMessage(**d) for d in docs]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
