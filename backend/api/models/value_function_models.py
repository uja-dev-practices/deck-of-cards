from pydantic import BaseModel, field_validator
from typing import List, Dict

class ValueFunctionRequest(BaseModel):
    criterion_name: str
    levels: List[str]
    blank_cards: List[int]
    references: Dict[str, float]

    @field_validator("criterion_name")
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío.")
        return v

    @field_validator("levels")
    def levels_not_empty(cls, v):
        if len(v) < 2:
            raise ValueError("Debe haber al menos 2 niveles.")
        return v

    @field_validator("blank_cards")
    def cards_valid(cls, v, info):
        if any(c < 0 for c in v):
            raise ValueError("Las cartas no pueden ser negativas.")

        levels = info.data.get("levels")
        if levels and len(v) != len(levels) - 1:
            raise ValueError("Debe haber uno menos de número de cartas blancas que de niveles.")
        return v

    @field_validator("references")
    def refs_valid(cls, v):
        if len(v) != 2:
            raise ValueError("Debe haber 2 referencias.")
        return v
