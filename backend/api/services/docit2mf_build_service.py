# services/docit2mf_build_service.py

from typing import List, Union
from api.models.docit2mf_models import DoCIT2MFRequest
from api.models.docmf_models import DoCMFRequest
from api.services.docmf_build_service import build_doc_mf_level


def _extract_bounds(values: List[Union[int, List[int], tuple]], mode: str) -> List[int]:
    """
    Devuelve una lista de enteros:
    - Si el valor es un entero → se usa tal cual para LMF y UMF
    - Si es un intervalo [min,max] → se usa min o max según mode
    """
    result = []
    for item in values:
        if isinstance(item, int):
            result.append(item)
        else:
            lo, hi = item
            result.append(lo if mode == "min" else hi)
    return result


def _sort_nodes(nodes):
    """Ordena los nodos por su coordenada X."""
    return sorted([list(p) for p in nodes], key=lambda p: p[0])


def _enforce_upper_ge_lower(lower, upper):
    """
    Garantiza que la UMF (upper) nunca quede por debajo de la LMF (lower).
    Ajusta los valores de pertenencia si es necesario.
    """
    # left nodes
    for i in range(len(lower["left_nodes"])):
        ly = lower["left_nodes"][i][1]
        uy = upper["left_nodes"][i][1]
        upper["left_nodes"][i][1] = max(uy, ly)

    # right nodes
    for i in range(len(lower["right_nodes"])):
        ly = lower["right_nodes"][i][1]
        uy = upper["right_nodes"][i][1]
        upper["right_nodes"][i][1] = max(uy, ly)

    return upper


def build_it2mf_from_level(level: DoCIT2MFRequest):
    """
    Construye una función IT2MF a partir de un nivel con intervalos de cartas blancas.
    Devuelve:
    {
        "term": ...,
        "lower": {...},
        "upper": {...}
    }
    """

    # -------------------------
    # LMF (mínimos)
    # -------------------------
    left_min = _extract_bounds(level.left_blank_cards, "min")
    right_min = _extract_bounds(level.right_blank_cards, "min")

    lower_level = DoCMFRequest(
        term=level.term,
        core=level.core,
        support=level.support,
        left_nodes_x=level.left_nodes_x,
        left_blank_cards=left_min,
        right_nodes_x=level.right_nodes_x,
        right_blank_cards=right_min,
    )

    # Convertir a dict para poder manipular como diccionario
    lower = build_doc_mf_level(lower_level)
    if hasattr(lower, "model_dump"):
        lower = lower.model_dump()

    # Asegurar que los nodos son listas mutables y ordenar
    lower["left_nodes"] = _sort_nodes(lower["left_nodes"])
    lower["right_nodes"] = _sort_nodes(lower["right_nodes"])

    # -------------------------
    # UMF (máximos)
    # -------------------------
    left_max = _extract_bounds(level.left_blank_cards, "max")
    right_max = _extract_bounds(level.right_blank_cards, "max")

    upper_level = DoCMFRequest(
        term=level.term,
        core=level.core,
        support=level.support,
        left_nodes_x=level.left_nodes_x,
        left_blank_cards=left_max,
        right_nodes_x=level.right_nodes_x,
        right_blank_cards=right_max,
    )

    # Convertir a dict para poder manipular como diccionario
    upper = build_doc_mf_level(upper_level)
    if hasattr(upper, "model_dump"):
        upper = upper.model_dump()

    # Asegurar que los nodos son listas mutables y ordenar
    upper["left_nodes"] = _sort_nodes(upper["left_nodes"])
    upper["right_nodes"] = _sort_nodes(upper["right_nodes"])

    # -------------------------
    # FIX: evitar inversión vertical (UMF < LMF)
    # -------------------------
    upper = _enforce_upper_ge_lower(lower, upper)

    return {
        "term": level.term,
        "lower": lower,
        "upper": upper
    }