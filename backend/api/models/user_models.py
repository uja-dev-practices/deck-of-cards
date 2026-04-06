from typing import List, Optional, Union
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# -----------------------------
# MODELOS DE FUNCIONES DIFUSAS
# -----------------------------

class FuzzyTerm(BaseModel):
    term: str
    core: List[float]
    support: List[float]
    left_nodes: List[List[float]]
    right_nodes: List[List[float]]


class IT2FuzzyTerm(BaseModel):
    term: str
    lower: FuzzyTerm
    upper: FuzzyTerm


# -----------------------------
# HISTORIAL
# -----------------------------

class HistoryItem(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    created_at: datetime
    results: List[Union[FuzzyTerm, IT2FuzzyTerm]]


class HistoryCreateRequest(BaseModel):
    name: str
    results: List[Union[FuzzyTerm, IT2FuzzyTerm]]


# -----------------------------
# USUARIOS
# -----------------------------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    username: str
    email: EmailStr
    password_hash: str
    token: Optional[str] = None
    history: List[HistoryItem] = []
