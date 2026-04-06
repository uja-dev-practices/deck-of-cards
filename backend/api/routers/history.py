# api/routers/history.py

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from api.database.mongodb import users_collection
from api.models.user_models import FuzzyTerm, IT2FuzzyTerm, HistoryCreateRequest
from api.utils.security import get_current_user

router = APIRouter(prefix="/history", tags=["history"])


# -----------------------------
# 1. Añadir un elemento al historial
# -----------------------------
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


# -----------------------------
# 2. Eliminar un elemento del historial
# -----------------------------
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


# -----------------------------
# 3. Obtener todos los historiales de todos los usuarios (ordenados)
# -----------------------------
@router.get("/all")
async def get_all_histories():
    users = await users_collection.find().to_list(None)

    all_histories = []

    for user in users:
        user_id = str(user["_id"])
        username = user.get("username", "unknown")
        history = user.get("history", [])

        for item in history:
            all_histories.append({
                "user_id": user_id,
                "username": username,
                "history_item": {
                    "_id": str(item["_id"]),
                    "name": item["name"],
                    "created_at": item["created_at"],
                    "results": item["results"]
                }
            })

    # Ordenar por fecha
    all_histories_sorted = sorted(
        all_histories,
        key=lambda h: h["history_item"]["created_at"]
    )

    return {"count": len(all_histories_sorted), "histories": all_histories_sorted}


# -----------------------------
# 4. Obtener historiales del usuario autenticado (ordenados)
# -----------------------------
@router.get("/user")
async def get_user_histories(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]

    user = await users_collection.find_one({"_id": user_id})

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado."
        )

    history = user.get("history", [])

    # Ordenar por fecha
    history_sorted = sorted(history, key=lambda h: h["created_at"])

    formatted_history = []
    for item in history_sorted:
        formatted_history.append({
            "_id": str(item["_id"]),
            "name": item["name"],
            "created_at": item["created_at"],
            "results": item["results"]
        })

    return {
        "user_id": str(user_id),
        "username": user.get("username", "unknown"),
        "count": len(formatted_history),
        "history": formatted_history
    }
