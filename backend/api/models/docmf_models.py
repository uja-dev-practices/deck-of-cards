from pydantic import BaseModel, field_validator
from typing import List, Tuple

class DoCMFRequest(BaseModel):
    term: str
    core: Tuple[float, float]
    support: Tuple[float, float]
    left_nodes_x: List[float]
    left_blank_cards: List[int]
    right_nodes_x: List[float]
    right_blank_cards: List[int]

    @field_validator("term")
    def term_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El término no puede estar vacío.")
        return v

    @field_validator("core")
    def core_valid(cls, v):
        a, b = v
        if a > b:
            raise ValueError("El núcleo debe cumplir a <= b.")
        return v

    @field_validator("support")
    def support_valid(cls, v, info):
        c, d = v
        if c >= d:
            raise ValueError("El soporte debe cumplir c < d.")

        core = info.data.get("core")
        if core:
            a, b = core
            if not (c <= a < b <= d):
                raise ValueError("El núcleo debe estar dentro del soporte.")
        return v

    @field_validator("left_blank_cards", "right_blank_cards")
    def cards_valid(cls, v):
        if any(c < 0 for c in v):
            raise ValueError("Las cartas no pueden ser negativas.")
        return v


class DoCMFMultiRequest(BaseModel):
    levels: List[DoCMFRequest]
