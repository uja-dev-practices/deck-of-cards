from fastapi import APIRouter, HTTPException
from models.value_function_models import ValueFunctionRequest
from services.value_function_service import compute_value_function, compute_points

router = APIRouter()

@router.post("/value-function")
def value_function(request: ValueFunctionRequest):
    try:
        return compute_value_function(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/value-function/points")
def value_function_points(request: ValueFunctionRequest):
    try:
        return compute_points(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
