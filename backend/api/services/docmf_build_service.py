# services/docmf_build_service.py

from api.models.docmf_models import DoCMFRequest
from api.models.user_models import FuzzyTerm


def build_single_docmf(request: DoCMFRequest):
    a, b = request.core
    c, d = request.support

    # LEFT
    TL = sum(e + 1 for e in request.left_blank_cards)
    YL = 1 / TL
    left_nodes = []
    acc = 0

    for i, x in enumerate(request.left_nodes_x):
        if i == 0:
            left_nodes.append((x, 0.0))
        else:
            acc += request.left_blank_cards[i - 1] + 1
            left_nodes.append((x, round(acc * YL, 4)))

    # RIGHT
    TR = sum(e + 1 for e in request.right_blank_cards)
    YR = 1 / TR
    right_nodes = []
    acc = 0

    for i, x in enumerate(request.right_nodes_x):
        if i == 0:
            right_nodes.append((x, 1.0))
        else:
            acc += request.right_blank_cards[i - 1] + 1
            right_nodes.append((x, round(1 - acc * YR, 4)))

    return {
        "term": request.term,
        "core": request.core,
        "support": request.support,
        "left_nodes": left_nodes,
        "right_nodes": right_nodes
    }


def build_docmf_multi(request):
    results = []
    for level in request.levels:
        result = build_single_docmf(level)
        results.append(result)
    return {"results": results}


def build_doc_mf_level(level: DoCMFRequest) -> FuzzyTerm:
    """
    Adaptador para reutilizar build_single_docmf con el modelo DoCMFRequest.
    Devuelve un FuzzyTerm, que es lo que espera el sistema IT2MF.
    """
    result = build_single_docmf(level)

    return FuzzyTerm(
        term=result["term"],
        core=list(result["core"]),
        support=list(result["support"]),
        left_nodes=[list(p) for p in result["left_nodes"]],
        right_nodes=[list(p) for p in result["right_nodes"]],
    )
