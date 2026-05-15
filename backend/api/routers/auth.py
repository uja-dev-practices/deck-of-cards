from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from api.database.mongodb import users_collection
from api.models.user_models import (
    EmailVerificationRequest,
    EmailVerificationResendRequest,
    UserCreate,
    UserLogin,
)
from api.services.email_service import send_verification_email
from api.utils.email_verification import (
    MAX_EMAIL_VERIFICATION_ATTEMPTS,
    generate_verification_code,
    get_verification_code_expiration,
    hash_verification_code,
    is_verification_code_expired,
    verify_verification_code,
)
from api.utils.security import (
    generate_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register_user(user: UserCreate):
    email = str(user.email).strip().lower()

    existing_username = await users_collection.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso",
        )

    existing_email = await users_collection.find_one({"email": email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    verification_code = generate_verification_code()

    user_doc = {
        "username": user.username,
        "email": email,
        "password_hash": hash_password(user.password),
        "token": None,
        "history": [],
        "is_email_verified": False,
        "email_verification_code_hash": hash_verification_code(
            email,
            verification_code,
        ),
        "email_verification_expires_at": get_verification_code_expiration(),
        "email_verification_attempts": 0,
        "email_verification_requested_at": datetime.utcnow(),
    }

    result = await users_collection.insert_one(user_doc)

    try:
        send_verification_email(email, user.username, verification_code)
    except Exception as exc:
        await users_collection.delete_one({"_id": result.inserted_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo enviar el correo de verificación",
        ) from exc

    return {
        "message": "Usuario registrado. Revisa tu correo para verificar la cuenta.",
        "user_id": str(result.inserted_id),
        "email": email,
        "requires_verification": True,
    }


@router.post("/verify-email")
async def verify_email(payload: EmailVerificationRequest):
    email = str(payload.email).strip().lower()
    code = payload.code.strip()

    if len(code) != 6 or not code.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código debe tener 6 dígitos",
        )

    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if user.get("is_email_verified"):
        new_token = generate_token()
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"token": new_token}},
        )
        return {
            "message": "Email ya verificado",
            "user_id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "token": new_token,
        }

    code_hash = user.get("email_verification_code_hash")
    expires_at = user.get("email_verification_expires_at")
    attempts = user.get("email_verification_attempts", 0)

    if not code_hash or not expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solicita un nuevo código de verificación",
        )

    if is_verification_code_expired(expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de verificación ha caducado",
        )

    if attempts >= MAX_EMAIL_VERIFICATION_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos. Solicita un nuevo código.",
        )

    if not verify_verification_code(email, code, code_hash):
        attempts += 1
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"email_verification_attempts": attempts}},
        )
        raise HTTPException(
            status_code=(
                status.HTTP_429_TOO_MANY_REQUESTS
                if attempts >= MAX_EMAIL_VERIFICATION_ATTEMPTS
                else status.HTTP_400_BAD_REQUEST
            ),
            detail="Código de verificación inválido",
        )

    new_token = generate_token()
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "is_email_verified": True,
                "email_verified_at": datetime.utcnow(),
                "token": new_token,
            },
            "$unset": {
                "email_verification_code_hash": "",
                "email_verification_expires_at": "",
                "email_verification_attempts": "",
                "email_verification_requested_at": "",
            },
        },
    )

    return {
        "message": "Email verificado correctamente",
        "user_id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "token": new_token,
    }


@router.post("/resend-verification")
async def resend_verification_email(payload: EmailVerificationResendRequest):
    email = str(payload.email).strip().lower()
    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if user.get("is_email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está verificado",
        )

    verification_code = generate_verification_code()
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "email_verification_code_hash": hash_verification_code(
                    email,
                    verification_code,
                ),
                "email_verification_expires_at": get_verification_code_expiration(),
                "email_verification_attempts": 0,
                "email_verification_requested_at": datetime.utcnow(),
            },
        },
    )

    try:
        send_verification_email(email, user["username"], verification_code)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo enviar el correo de verificación",
        ) from exc

    return {"message": "Nuevo código de verificación enviado"}


@router.post("/login")
async def login_user(credentials: UserLogin):
    email = str(credentials.email).strip().lower()
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    password_hash = user.get("password_hash")
    if not password_hash or not verify_password(credentials.password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if user.get("is_email_verified") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes verificar tu email antes de iniciar sesión",
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
        "email": user["email"],
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
