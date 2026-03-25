from fastapi import APIRouter, HTTPException
from models.docmf_validation_models import ValidationRequest
from services.docmf_validation_service import validate_levels

router = APIRouter()

@router.post("/validate")
def validate_docmf_levels(request: ValidationRequest):
    results = validate_levels(request.levels)

    invalid = [r for r in results if not r["valid"]]

    if len(request.levels) == 1:
        # Caso de un solo nivel
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

    # Caso de varios niveles
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
