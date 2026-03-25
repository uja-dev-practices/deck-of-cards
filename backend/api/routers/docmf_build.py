from fastapi import APIRouter, HTTPException
from models.docmf_models import DoCMFMultiRequest
from services.docmf_build_service import build_docmf_multi

router = APIRouter()

@router.post("/build")
def build(request: DoCMFMultiRequest):
    try:
        return build_docmf_multi(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
