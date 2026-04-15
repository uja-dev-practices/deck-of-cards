from fastapi import APIRouter
from api.database.mongodb import db

router = APIRouter()

@router.get("/test-mongo")
async def test_mongo():
    try:
        await db.command("ping")
        return {"status": "ok", "message": "Conexión a MongoDB correcta"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
