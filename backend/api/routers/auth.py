from fastapi import APIRouter, HTTPException, status
from api.database.mongodb import users_collection
from api.models.user_models import UserCreate, UserLogin
from api.utils.security import hash_password, verify_password, generate_token
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from api.utils.security import (
    hash_password,
    verify_password,
    generate_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register_user(user: UserCreate):
    existing_username = await users_collection.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso",
        )

    existing_email = await users_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    token = generate_token()

    user_doc = {
        "username": user.username,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "token": token,
        "history": [],
    }

    result = await users_collection.insert_one(user_doc)

    return {
        "message": "Usuario registrado correctamente",
        "user_id": str(result.inserted_id),
        "token": token,
    }


@router.post("/login")
async def login_user(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    new_token = generate_token()

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"token": new_token}}
    )

    return {
        "message": "Login correcto",
        "user_id": str(user["_id"]),
        "username": user["username"],
        "token": new_token,
    }


@router.post("/logout/{user_id}")
async def logout_user(user_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"token": None}}
    )

    return {"message": "Sesión cerrada correctamente"}


@router.post("/logout")
async def logout_user(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]

    await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"token": None}},
    )

    return {"message": "Sesión cerrada correctamente"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
    }
