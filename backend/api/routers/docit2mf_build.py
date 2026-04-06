# routers/docit2mf_build.py

from fastapi import APIRouter, Depends, HTTPException
from api.models.docit2mf_models import DoCIT2MFMultiRequest
from api.services.docit2mf_build_service import build_it2mf_from_level
from api.utils.security import get_current_user

router = APIRouter(prefix="/criteria", tags=["criteria"])


@router.post("/doc-it2mf/build")
async def build_doc_it2mf(
    request: DoCIT2MFMultiRequest,
    current_user: dict = Depends(get_current_user)
):
    results = []

    try:
        for level in request.levels:
            results.append(build_it2mf_from_level(level))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"levels": results}
