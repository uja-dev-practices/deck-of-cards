from fastapi import FastAPI

app = FastAPI()

@app.get("/prueba")
def ruta_de_prueba():
    # En FastAPI si devuelves un diccionario, se transforma a JSON
    return {"mensaje": "¡Hola desde FastAPI! El contenedor de docker está funcionando"}