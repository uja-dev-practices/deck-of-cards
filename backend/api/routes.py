from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

class ValueFunctionRequest(BaseModel):
    criterion_name: str
    levels: List[str]
    blank_cards: List[int]
    references: Dict[str, float]

@app.get("/prueba")
def prueba():
    return {"mensaje": "¡Hola desde FastAPI! El contenedor de docker está funcionando"}

@app.post("/api/criteria/doc/value-function")
def calcular(request: ValueFunctionRequest):
    levels = request.levels
    cards_between_levels = request.blank_cards
    reference_values = request.references

    # Índices de referencia (por ejemplo 0 y 4)
    ref_indices = sorted(int(k) for k in reference_values)
    lower_ref, upper_ref = ref_indices

    # Valores asignados a esas referencias
    lower_value = reference_values[str(lower_ref)]
    upper_value = reference_values[str(upper_ref)]

    # Total de unidades entre las referencias
    total_units = sum(cards_between_levels[i] + 1 for i in range(lower_ref, upper_ref))

    # Valor por unidad
    unit_value = (upper_value - lower_value) / total_units if total_units else 0

    # Lista de valores finales
    values = [0] * len(levels)
    values[lower_ref] = lower_value

    # Hacia arriba
    for i in range(lower_ref + 1, len(levels)):
        units = sum(cards_between_levels[r] + 1 for r in range(lower_ref, i))
        values[i] = lower_value + unit_value * units

    # Hacia abajo
    for i in range(lower_ref - 1, -1, -1):
        units = sum(cards_between_levels[r] + 1 for r in range(i, lower_ref))
        values[i] = lower_value - unit_value * units

    return {
        "criterion_name": request.criterion_name,
        "values": {levels[i]: round(values[i], 4) for i in range(len(levels))}
    }
