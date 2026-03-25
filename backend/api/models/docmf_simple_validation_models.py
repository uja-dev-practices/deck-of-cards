from pydantic import BaseModel, field_validator
from typing import List, Tuple

class SimpleLevelDefinition(BaseModel):
    core: Tuple[float, float]
    support: Tuple[float, float]

    @field_validator("core")
    def validate_core(cls, v):
        a, b = v
        if a >= b:
            raise ValueError("El núcleo debe cumplir a < b.")
        return v

    @field_validator("support")
    def validate_support(cls, v):
        c, d = v
        if c >= d:
            raise ValueError("El soporte debe cumplir c < d.")
        return v


class SimpleValidationRequest(BaseModel):
    levels: List[SimpleLevelDefinition]
