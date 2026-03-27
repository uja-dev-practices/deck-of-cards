from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from api.database.mongodb import users_collection
from api.models.user_models import FuzzyTerm, HistoryCreateRequest
from api.utils.security import get_current_user

router = APIRouter(prefix="/history", tags=["history"])


@router.post("/add")
async def add_history_item(
    data: HistoryCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]

    history_item_id = ObjectId()
    history_item = {
        "_id": history_item_id,
        "name": data.name,
        "created_at": datetime.utcnow(),
        "results": [r.dict() for r in data.results],
    }

    await users_collection.update_one(
        {"_id": user_id},
        {"$push": {"history": history_item}},
    )

    return {
        "message": "Elemento añadido al historial",
        "history_item_id": str(history_item_id),
    }


@router.delete("/delete/{history_item_id}")
async def delete_history_item(
    history_item_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]

    result = await users_collection.update_one(
        {"_id": user_id},
        {"$pull": {"history": {"_id": ObjectId(history_item_id)}}},
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Elemento de historial no encontrado",
        )

    return {"message": "Elemento eliminado del historial"}
