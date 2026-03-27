from fastapi import APIRouter, HTTPException
from api.models.evaluation_models import EvaluationRequest
from api.services.docmf_evaluate_service import evaluate_docmf

router = APIRouter()

@router.post("/evaluate")
def evaluate(request: EvaluationRequest):
    try:
        return evaluate_docmf(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
