# app/utils/validators.py
from fastapi import HTTPException

def ensure_positive(value: float, field: str):
    if value < 0:
        raise HTTPException(status_code=400, detail=f"{field} must be positive")
