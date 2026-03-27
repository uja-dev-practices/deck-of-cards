from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from api.database.mongodb import users_collection
from api.models.user_models import FuzzyTerm, HistoryCreateRequest

router = APIRouter(prefix="/history", tags=["history"])


@router.post("/{user_id}/add")
async def add_history_item(user_id: str, data: HistoryCreateRequest):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    history_item_id = ObjectId()

    history_item = {
        "_id": history_item_id,
        "name": data.name,  # ← nuevo campo
        "created_at": datetime.utcnow(),
        "results": [r.dict() for r in data.results],
    }

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"history": history_item}},
    )

    return {
        "message": "Elemento añadido al historial",
        "history_item_id": str(history_item_id),
    }



@router.delete("/{user_id}/delete/{history_item_id}")
async def delete_history_item(user_id: str, history_item_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"history": {"_id": ObjectId(history_item_id)}}},
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Elemento de historial no encontrado",
        )

    return {"message": "Elemento eliminado del historial"}
