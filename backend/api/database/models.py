from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float

Base = declarative_base()

class DoCMFLevel(Base):
    __tablename__ = "docmf_levels"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(50), nullable=False)
    core_a = Column(Float, nullable=False)
    core_b = Column(Float, nullable=False)
    support_c = Column(Float, nullable=False)
    support_d = Column(Float, nullable=False)
