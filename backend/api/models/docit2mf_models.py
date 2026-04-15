from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import List, Tuple, Union

BlankCardInput = Union[int, Tuple[int, int], List[int]]

class DoCIT2MFRequest(BaseModel):
    term: str
    core: tuple[float, float] = Field(..., description="Núcleo del conjunto difuso: [a, b]")
    support: tuple[float, float] = Field(..., description="Soporte del conjunto difuso: [c, d]")

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
            raise ValueError("el 'Inicio del Núcleo' debe ser menor o igual al 'Fin del Núcleo'.")
        return v

    @field_validator("support")
    def support_valid(cls, v, info: ValidationInfo):
        c, d = v
        if c > d:
            raise ValueError("el 'Inicio del Soporte' debe ser menor o igual al 'Fin del Soporte'.")

        core = info.data.get("core")
        if core:
            a, b = core
            if not (c <= a and b <= d):
                raise ValueError("los valores del 'Núcleo' deben estar estrictamente dentro del 'Soporte'.")
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
