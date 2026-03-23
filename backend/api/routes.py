from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Tuple
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

# Configuración CORS para permitir peticiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cualquier origen (perfecto para desarrollo local)
    allow_credentials=True,
    allow_methods=["*"],  # Permite POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Permite cualquier cabecera
)

# -----------------------------
# MODELOS
# -----------------------------

class ValueFunctionRequest(BaseModel):
    criterion_name: str
    levels: List[str]
    blank_cards: List[int]
    references: Dict[str, float]

class DoCMFRequest(BaseModel):
    term: str
    core: Tuple[float, float]      # [a, b]
    support: Tuple[float, float]   # [c, d]
    left_nodes_x: List[float]
    left_blank_cards: List[int]
    right_nodes_x: List[float]
    right_blank_cards: List[int]

class EvaluationRequest(BaseModel):
    x: float
    left_nodes: List[Tuple[float, float]]
    right_nodes: List[Tuple[float, float]]
    core: Tuple[float, float]
    support: Tuple[float, float]


# -----------------------------
# ENDPOINT 1: FUNCIÓN DE VALOR DoC
# -----------------------------

@app.post("/api/criteria/doc/value-function")
def calcular_value_function(request: ValueFunctionRequest):
    levels = request.levels
    cards = request.blank_cards
    refs = request.references

    ref_indices = sorted(int(k) for k in refs)
    p, q = ref_indices
    up, uq = refs[str(p)], refs[str(q)]

    total_units = sum(cards[i] + 1 for i in range(p, q))
    alpha = (uq - up) / total_units if total_units else 0

    values = [0] * len(levels)
    values[p] = up

    for i in range(p + 1, len(levels)):
        units = sum(cards[r] + 1 for r in range(p, i))
        values[i] = up + alpha * units

    for i in range(p - 1, -1, -1):
        units = sum(cards[r] + 1 for r in range(i, p))
        values[i] = up - alpha * units

    return {
        "criterion_name": request.criterion_name,
        "values": {levels[i]: round(values[i], 4) for i in range(len(levels))}
    }


# -----------------------------
# ENDPOINT 2: CONSTRUIR DoC-MF
# -----------------------------

@app.post("/api/criteria/doc-mf/build")
def build_doc_mf(request: DoCMFRequest):

    a, b = request.core
    c, d = request.support

    # ---- LADO IZQUIERDO ----
    left_x = request.left_nodes_x
    left_e = request.left_blank_cards

    TL = sum(e + 1 for e in left_e)
    YL = 1 / TL if TL else 0

    left_nodes = []
    acc = 0
    for i in range(len(left_x)):
        if i == 0:
            left_nodes.append((left_x[i], 0.0))
        else:
            acc += (left_e[i-1] + 1)
            left_nodes.append((left_x[i], round(acc * YL, 4)))

    # ---- LADO DERECHO ----
    right_x = request.right_nodes_x
    right_e = request.right_blank_cards

    TR = sum(e + 1 for e in right_e)
    YR = 1 / TR if TR else 0

    right_nodes = []
    acc = 0
    for i in range(len(right_x)):
        if i == 0:
            right_nodes.append((right_x[i], 1.0))
        else:
            acc += (right_e[i-1] + 1)
            right_nodes.append((right_x[i], round(1 - acc * YR, 4)))

    return {
        "term": request.term,
        "core": request.core,
        "support": request.support,
        "left_nodes": left_nodes,
        "right_nodes": right_nodes
    }


# -----------------------------
# ENDPOINT 3: EVALUAR UN VALOR x
# -----------------------------

def linear_interpolation(x, nodes):
    for i in range(len(nodes) - 1):
        x0, y0 = nodes[i]
        x1, y1 = nodes[i+1]
        if x0 <= x <= x1:
            t = (x - x0) / (x1 - x0)
            return y0 + t * (y1 - y0)
    return 0.0

@app.post("/api/criteria/doc-mf/evaluate")
def evaluate_doc_mf(request: EvaluationRequest):
    x = request.x
    a, b = request.core
    c, d = request.support

    if x < c or x > d:
        return {"membership": 0.0}

    if a <= x <= b:
        return {"membership": 1.0}

    if c <= x < a:
        return {"membership": linear_interpolation(x, request.left_nodes)}

    if b < x <= d:
        return {"membership": linear_interpolation(x, request.right_nodes)}

    return {"membership": 0.0}


# -----------------------------
# ENDPOINT 4: PUNTOS (x,y) DE LA FUNCIÓN DE VALOR
# -----------------------------

@app.post("/api/criteria/doc/value-function/points")
def value_function_points(request: ValueFunctionRequest):
    levels = request.levels
    cards = request.blank_cards
    refs = request.references

    ref_indices = sorted(int(k) for k in refs)
    p, q = ref_indices
    up, uq = refs[str(p)], refs[str(q)]

    total_units = sum(cards[i] + 1 for i in range(p, q))
    alpha = (uq - up) / total_units if total_units else 0

    values = [0] * len(levels)
    values[p] = up

    for i in range(p + 1, len(levels)):
        units = sum(cards[r] + 1 for r in range(p, i))
        values[i] = up + alpha * units

    for i in range(p - 1, -1, -1):
        units = sum(cards[r] + 1 for r in range(i, p))
        values[i] = up - alpha * units

    points = [{"x": i, "y": round(values[i], 4)} for i in range(len(levels))]

    return {"points": points}
