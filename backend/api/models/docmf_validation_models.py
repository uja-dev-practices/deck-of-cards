from pydantic import BaseModel, field_validator
from typing import List, Tuple

class LevelDefinition(BaseModel):
    core: Tuple[float, float]
    support: Tuple[float, float]
    left_nodes: List[Tuple[float, float]]
    right_nodes: List[Tuple[float, float]]

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

    @field_validator("left_nodes", "right_nodes")
    def validate_nodes(cls, v):
        if len(v) < 2:
            raise ValueError("Debe haber al menos 2 nodos.")
        xs = [p[0] for p in v]
        if xs != sorted(xs):
            raise ValueError("Los nodos deben estar ordenados por x.")
        if len(xs) != len(set(xs)):
            raise ValueError("Los nodos no pueden tener valores x duplicados.")
        return v


class ValidationRequest(BaseModel):
    levels: List[LevelDefinition]
