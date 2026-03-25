from fastapi import APIRouter, HTTPException
from models.docmf_models import DoCMFRequest
from services.docmf_build_service import build_docmf

router = APIRouter()

@router.post("/build")
def build(request: DoCMFRequest):
    try:
        return build_docmf(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
