from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# 1. Definimos el modelo de datos basado en el JSON que se enviará desde el frontend
class ValueFunctionRequest(BaseModel):
    criterion_name: str
    levels: List[str]
    blank_cards: List[int]
    references: Dict[str, float]

# Ruta prueba para probar que todo funciona
@app.get("/prueba")
def ruta_de_prueba():
    return {"mensaje": "¡Hola desde FastAPI! El contenedor de docker está funcionando"}

# 2. Endpoint POST para recibir los datos y calcular los valores
@app.post("/api/criteria/doc/value-function")
def calcular_funcion_valor(request: ValueFunctionRequest):
    levels = request.levels
    blank_cards = request.blank_cards
    refs = request.references
    
    # Extraemos las claves de referencia y las convertimos a enteros
    claves_ref = sorted(int(k) for k in refs.keys())  # ejemplo: [0, 4]
    p, q = claves_ref  # p = 0, q = 4

    # Valores de referencia
    up = refs[str(p)]
    uq = refs[str(q)]
    
    # PASO A: Calculamos el número total de unidades elementales 'h' entre p y q
    h = sum(blank_cards[r] + 1 for r in range(p, q))
    
    # PASO B: Calculamos el valor fraccional de una sola unidad 'alpha'
    alpha = (uq - up) / h if h != 0 else 0
    
    # Inicializamos la lista de valores V con el tamaño de los niveles
    V = [0.0] * len(levels)
    V[p] = up
    
    # PASO C: Calculamos los valores hacia adelante (niveles por encima de p)
    for i in range(p + 1, len(levels)):
        suma_unidades = sum(blank_cards[r] + 1 for r in range(p, i))
        V[i] = up + alpha * suma_unidades
        
    # PASO D: Calculamos los valores hacia atrás (niveles por debajo de p)
    for i in range(p - 1, -1, -1):
        suma_unidades = sum(blank_cards[r] + 1 for r in range(i, p))
        V[i] = up - alpha * suma_unidades
        
    # Formateamos la respuesta
    resultado_valores = {levels[i]: round(V[i], 4) for i in range(len(levels))}
    
    return {
        "criterion_name": request.criterion_name,
        "values": resultado_valores
    }
