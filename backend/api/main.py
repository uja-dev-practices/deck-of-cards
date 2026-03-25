from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.value_function import router as value_router
from routers.docmf_build import router as docmf_build_router
from routers.docmf_evaluate import router as docmf_eval_router
from routers.docmf_simple_validation import router as simple_validation_router
from routers.docmf_validation import router as validation_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(value_router, prefix="/api/criteria/doc")
app.include_router(docmf_build_router, prefix="/api/criteria/doc-mf")
app.include_router(docmf_eval_router, prefix="/api/criteria/doc-mf")
app.include_router(simple_validation_router, prefix="/api/criteria/doc-mf")
app.include_router(validation_router, prefix="/api/criteria/doc-mf")
