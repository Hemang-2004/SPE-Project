# app/utils/helpers.py
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.database.user_schema import User
from app.database.twin_schema import Twin

def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_twin_or_404(db: Session, twin_id: int) -> Twin:
    twin = db.query(Twin).filter(Twin.id == twin_id).first()
    if not twin:
        raise HTTPException(status_code=404, detail="Twin not found")
    return twin
