from fastapi import APIRouter, HTTPException
from models.evaluation_models import EvaluationRequest
from services.docmf_evaluate_service import evaluate_docmf

router = APIRouter()

@router.post("/evaluate")
def evaluate(request: EvaluationRequest):
    try:
        return evaluate_docmf(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
