# app/database/user_schema.py
from sqlalchemy import Column, Integer, String
from app.database.db import Base
from pydantic import BaseModel, EmailStr

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)  # keep simple for now

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    name: str

    class Config:
        orm_mode = True
