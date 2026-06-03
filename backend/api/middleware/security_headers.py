from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from api.config.settings import Settings, get_settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, settings: Settings | None = None):
        super().__init__(app)
        self._settings = settings or get_settings()

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")

        if request.url.scheme == "https" or self._settings.is_production:
            hsts = f"max-age={self._settings.SECURITY_HSTS_SECONDS}"
            response.headers.setdefault("Strict-Transport-Security", hsts)

        return response
