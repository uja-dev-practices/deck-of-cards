from pydantic import BaseModel, field_validator
from typing import List, Tuple

class EvaluationRequest(BaseModel):
    x: float
    core: Tuple[float, float]
    support: Tuple[float, float]
    left_nodes: List[Tuple[float, float]]
    right_nodes: List[Tuple[float, float]]

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

    @field_validator("left_nodes", "right_nodes")
    def nodes_valid(cls, v):
        if len(v) < 2:
            raise ValueError("Debe haber al menos 2 nodos.")
        return v
