# api/routers/docit2mf_build.py

import logging
from fastapi import APIRouter, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.models.docit2mf_models import DoCIT2MFMultiRequest
from api.services.docit2mf_build_service import build_it2mf_from_level

router = APIRouter(prefix="/criteria", tags=["criteria"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.post("/doc-it2mf/build")
@limiter.limit("10/minute")
async def build_doc_it2mf(request: DoCIT2MFMultiRequest):
    results = []

    try:
        for level in request.levels:
            results.append(build_it2mf_from_level(level))
    except ValueError as e:
        logger.warning(f"Validation error in doc-it2mf/build: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid input data")
    except Exception as e:
        logger.error(f"Unexpected error in doc-it2mf/build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {"levels": results}
