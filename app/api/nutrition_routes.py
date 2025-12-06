# app/api/nutrition_routes.py

from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.twin_schema import Twin
from app.utils.helpers import get_twin_or_404
from app.core.nutrition import build_nutrition_recommendation

router = APIRouter()


@router.get("/recommendation/{user_id}")
def nutrition_recommendation(user_id: int, db: Session = get_db()):
    twin = db.query(Twin).filter(Twin.user_id == user_id).first()
    twin = get_twin_or_404(db, twin.id)

    recommendation = build_nutrition_recommendation(twin)

    return {
        "user_id": user_id,
        "recommendation": recommendation,
    }
