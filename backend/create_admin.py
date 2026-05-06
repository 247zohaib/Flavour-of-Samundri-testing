import asyncio
import bcrypt
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["flavours_samundri"]
    
    email = "admin@flavours.com"
    password = "admin123"
    
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    await db.admin_users.delete_many({"email": email})
    await db.admin_users.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hashed,
        "name": "Owner",
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    print("Admin user created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    client.close()

asyncio.run(main())