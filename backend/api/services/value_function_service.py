def compute_value_function(request):
    levels = request.levels
    cards = request.blank_cards
    refs = request.references

    p, q = sorted(int(k) for k in refs)
    up, uq = refs[str(p)], refs[str(q)]

    if len(levels) < 3:
        raise ValueError("Mínimo debe haber 3 niveles para esta funcionalidad.")

    total_units = sum(cards[i] + 1 for i in range(p, q))
    if total_units == 0:
        raise ValueError("Las cartas no pueden generar 0 unidades.")

    alpha = (uq - up) / total_units

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


def compute_points(request):
    result = compute_value_function(request)
    values = list(result["values"].values())
    return {"points": [{"x": i, "y": values[i]} for i in range(len(values))]}
