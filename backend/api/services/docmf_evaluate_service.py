from utils.interpolation import linear_interpolation

def evaluate_docmf(request):
    x = request.x
    a, b = request.core
    c, d = request.support

    if x < c or x > d:
        return {"membership": 0.0, "explanation": "Fuera del soporte."}

    if a <= x <= b:
        return {"membership": 1.0, "explanation": "Dentro del núcleo."}

    if c <= x < a:
        mu = linear_interpolation(x, request.left_nodes)
        return {"membership": mu, "explanation": f"El valor x={x} se interpola entre los nodos {request.left_nodes} del lado izquierdo."}

    if b < x <= d:
        mu = linear_interpolation(x, request.right_nodes)
        return {"membership": mu, "explanation": f"El valor x={x} se interpola entre los nodos {request.right_nodes} del lado derecho."}

    raise ValueError("No se pudo evaluar el valor.")
