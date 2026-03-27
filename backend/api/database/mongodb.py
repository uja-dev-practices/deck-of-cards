from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://mongo:27017"
DB_NAME = "deckofcards"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

users_collection = db["users"]
