def validate_single_level(level: dict):
    errors = []

    a, b = level["core"]
    c, d = level["support"]

    # Core dentro del soporte
    if not (c <= a < b <= d):
        errors.append("El núcleo debe estar completamente dentro del soporte.")

    # Nodos cubren correctamente el soporte
    left = level["left_nodes"]
    right = level["right_nodes"]

    if left[0][0] != c:
        errors.append("El primer nodo izquierdo debe coincidir con el inicio del soporte.")
    if left[-1][0] != a:
        errors.append("El último nodo izquierdo debe coincidir con el inicio del núcleo.")

    if right[0][0] != b:
        errors.append("El primer nodo derecho debe coincidir con el final del núcleo.")
    if right[-1][0] != d:
        errors.append("El último nodo derecho debe coincidir con el final del soporte.")

    return errors


def validate_levels(levels):
    results = []

    for idx, level in enumerate(levels):
        errors = validate_single_level(level.dict())
        results.append({
            "level_index": idx,
            "valid": len(errors) == 0,
            "errors": errors
        })

    return results
