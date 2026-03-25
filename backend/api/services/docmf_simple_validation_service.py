def validate_simple_level(level: dict):
    errors = []

    a, b = level["core"]
    c, d = level["support"]

    # Validación: núcleo dentro del soporte
    if not (c <= a < b <= d):
        errors.append("El núcleo debe estar completamente dentro del soporte.")

    return errors


def validate_simple_levels(levels):
    results = []

    for idx, level in enumerate(levels):
        errors = validate_simple_level(level.dict())
        results.append({
            "level_index": idx,
            "valid": len(errors) == 0,
            "errors": errors
        })

    return results
