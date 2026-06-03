import os
from functools import lru_cache


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECURITY_HSTS_SECONDS: int = int(os.getenv("SECURITY_HSTS_SECONDS", "31536000"))

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() == "production"

    @property
    def cors_allowed_origins(self) -> list[str]:
        configured = _split_csv(os.getenv("CORS_ALLOWED_ORIGINS"))
        if configured:
            return configured
        if self.is_production:
            frontend = os.getenv("FRONTEND_URL", "").rstrip("/")
            return [frontend] if frontend else []
        return ["*"]

    @property
    def trusted_hosts(self) -> list[str]:
        configured = _split_csv(os.getenv("TRUSTED_HOSTS"))
        if configured:
            return configured
        if self.is_production:
            return ["sinbad2.ujaen.es"]
        return ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
