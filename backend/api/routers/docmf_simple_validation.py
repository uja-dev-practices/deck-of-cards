from fastapi import APIRouter, HTTPException
from api.models.docmf_simple_validation_models import SimpleValidationRequest
from api.services.docmf_simple_validation_service import validate_simple_levels

router = APIRouter()

@router.post("/validate-simple")
def validate_simple_docmf(request: SimpleValidationRequest):
    results = validate_simple_levels(request.levels)
    invalid = [r for r in results if not r["valid"]]

    if len(request.levels) == 1:
        if invalid:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "El nivel es incorrecto.",
                    "errors": invalid[0]["errors"]
                }
            )
        return {
            "message": "El nivel es correcto.",
            "details": results[0]
        }

    if invalid:
        return {
            "message": "Validación completada.",
            "valid_levels": [r for r in results if r["valid"]],
            "invalid_levels": invalid
        }

    return {
        "message": "Todos los niveles son correctos.",
        "results": results
    }
