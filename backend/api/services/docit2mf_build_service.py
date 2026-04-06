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
            # valor fijo → mismo para LMF y UMF
            result.append(item)
        else:
            lo, hi = item
            result.append(lo if mode == "min" else hi)
    return result


def build_it2mf_from_level(level: DoCIT2MFRequest):
    # LMF (mínimos)
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
    lower = build_doc_mf_level(lower_level)

    # UMF (máximos)
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
    upper = build_doc_mf_level(upper_level)

    return {
        "term": level.term,
        "lower": lower,
        "upper": upper
    }
