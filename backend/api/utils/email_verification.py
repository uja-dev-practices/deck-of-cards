import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta


EMAIL_VERIFICATION_CODE_TTL_MINUTES = int(
    os.getenv("EMAIL_VERIFICATION_CODE_TTL_MINUTES", "15")
)
MAX_EMAIL_VERIFICATION_ATTEMPTS = int(
    os.getenv("EMAIL_VERIFICATION_MAX_ATTEMPTS", "5")
)


def generate_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def get_verification_code_expiration() -> datetime:
    return datetime.utcnow() + timedelta(minutes=EMAIL_VERIFICATION_CODE_TTL_MINUTES)


def _verification_secret() -> bytes:
    secret = (
        os.getenv("EMAIL_VERIFICATION_SECRET")
        or os.getenv("SECRET_KEY")
        or "development-email-verification-secret"
    )
    return secret.encode("utf-8")


def hash_verification_code(email: str, code: str) -> str:
    normalized_email = email.strip().lower()
    payload = f"{normalized_email}:{code}".encode("utf-8")
    return hmac.new(_verification_secret(), payload, hashlib.sha256).hexdigest()


def verify_verification_code(email: str, code: str, code_hash: str) -> bool:
    expected_hash = hash_verification_code(email, code)
    return hmac.compare_digest(expected_hash, code_hash)


def is_verification_code_expired(expires_at: datetime) -> bool:
    return expires_at < datetime.utcnow()
