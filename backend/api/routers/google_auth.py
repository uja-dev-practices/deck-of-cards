# api/routers/google_auth.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from bson import ObjectId
import httpx
import os
import jwt

from api.database.mongodb import users_collection
from api.utils.security import create_access_token

router = APIRouter(prefix="/auth/google", tags=["auth"])


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/api/auth/google/callback"


# -----------------------------
# 1. LOGIN → REDIRECCIÓN A GOOGLE
# -----------------------------
@router.get("/login")
async def google_login():
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )

    return RedirectResponse(google_auth_url)


# -----------------------------
# 2. CALLBACK → GOOGLE DEVUELVE EL CODE
# -----------------------------
@router.get("/callback")
async def google_callback(code: str):

    # 1. Intercambiar code por access_token
    token_url = "https://oauth2.googleapis.com/token"

    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=data)
        token_json = token_response.json()

    if "access_token" not in token_json:
        raise HTTPException(status_code=400, detail="Error obteniendo token de Google")

    access_token = token_json["access_token"]

    # 2. Obtener datos del usuario desde Google
    async with httpx.AsyncClient() as client:
        userinfo = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

    user_data = userinfo.json()

    google_id = user_data["id"]
    email = user_data["email"]
    name = user_data.get("name", "Usuario")

    # 3. Buscar usuario en MongoDB
    user = await users_collection.find_one({"email": email})

    if not user:
        # Crear usuario nuevo
        new_user = {
            "username": name,
            "email": email,
            "password_hash": None,  # No hay contraseña
            "google_id": google_id,
            "history": [],
        }

        result = await users_collection.insert_one(new_user)
        user_id = result.inserted_id
    else:
        user_id = user["_id"]

    # 4. Crear JWT de tu sistema
    token = create_access_token({"user_id": str(user_id)})

    # 5. Redirigir al frontend con el token
    return {"message": "Login con Google exitoso", "token": token}
