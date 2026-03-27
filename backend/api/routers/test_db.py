from fastapi import APIRouter, Depends
from sqlalchemy import text
from api.database.session import get_db

router = APIRouter()

@router.get("/test-db")
def test_db_connection(db=Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Conexión a MySQL correcta"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
