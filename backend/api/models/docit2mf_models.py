# models/docit2mf_models.py

from pydantic import BaseModel, field_validator
from typing import List, Tuple, Union


BlankCardInput = Union[int, Tuple[int, int], List[int]]


class DoCIT2MFRequest(BaseModel):
    term: str
    core: Tuple[float, float]
    support: Tuple[float, float]

    left_nodes_x: List[float]
    left_blank_cards: List[BlankCardInput]

    right_nodes_x: List[float]
    right_blank_cards: List[BlankCardInput]

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
            if not (c <= a <= b <= d):
                raise ValueError("El núcleo debe estar dentro del soporte.")
        return v

    @field_validator("left_blank_cards", "right_blank_cards")
    def validate_cards(cls, v):
        for item in v:
            # Caso 1: entero
            if isinstance(item, int):
                if item < 0:
                    raise ValueError("Las cartas no pueden ser negativas.")
            # Caso 2: lista o tupla [min,max]
            elif isinstance(item, (list, tuple)):
                if len(item) != 2:
                    raise ValueError("Los intervalos deben ser [min, max].")
                lo, hi = item
                if lo < 0 or hi < 0:
                    raise ValueError("Las cartas no pueden ser negativas.")
                if lo > hi:
                    raise ValueError("Debe cumplirse min <= max.")
            else:
                raise ValueError("Formato inválido para cartas blancas.")
        return v


class DoCIT2MFMultiRequest(BaseModel):
    levels: List[DoCIT2MFRequest]
