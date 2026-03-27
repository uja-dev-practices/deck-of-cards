from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.database.mongodb import db

# Routers
from api.routers.test_mongo import router as test_mongo_router
from api.routers.value_function import router as value_router
from api.routers.docmf_build import router as docmf_build_router
from api.routers.docmf_evaluate import router as docmf_eval_router
from api.routers.docmf_simple_validation import router as simple_validation_router
from api.routers.docmf_validation import router as validation_router
from api.routers.auth import router as auth_router
from api.routers.history import router as history_router
from api.routers.test_mongo import router as test_mongo_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Aquí podrías hacer comprobaciones si quieres
    yield
    # No hace falta cerrar nada con Motor

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_mongo_router, prefix="/api")
app.include_router(value_router, prefix="/api/criteria/doc")
app.include_router(docmf_build_router, prefix="/api/criteria/doc-mf")
app.include_router(docmf_eval_router, prefix="/api/criteria/doc-mf")
app.include_router(simple_validation_router, prefix="/api/criteria/doc-mf")
app.include_router(validation_router, prefix="/api/criteria/doc-mf")
app.include_router(test_mongo_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(history_router, prefix="/api")