from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class FuzzyTerm(BaseModel):
    term: str
    core: List[float]
    support: List[float]
    left_nodes: List[List[float]]
    right_nodes: List[List[float]]


class HistoryItem(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    created_at: datetime
    results: List[FuzzyTerm]


class HistoryCreateRequest(BaseModel):
    name: str
    results: List[FuzzyTerm]


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

