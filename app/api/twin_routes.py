# app/api/twin_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.twin_schema import Twin, TwinCreate, TwinRead
from app.utils.helpers import get_user_or_404
from app.core.baseline_model import build_baseline_for_twin
from app.ml.health_score_model import compute_scores_from_features

router = APIRouter()


@router.post("/create", response_model=TwinRead)
def create_twin(payload: TwinCreate, db: Session = get_db()):
    user = get_user_or_404(db, payload.user_id)

    twin = Twin(
        user_id=payload.user_id,
        age=payload.age,
        gender=payload.gender,
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        fasting_sugar=payload.fasting_sugar,
        resting_hr=payload.resting_hr,
        spo2=payload.spo2,
        cholesterol=payload.cholesterol,
        sleep_hours=payload.sleep_hours,
        exercise_level=payload.exercise_level,
        stress_level=payload.stress_level,
        smoking=payload.smoking,
        alcohol=payload.alcohol,
        screen_time_hours=payload.screen_time_hours,
    )

    # derive scores
    bmi = payload.weight_kg / ((payload.height_cm / 100) ** 2)
    scores = compute_scores_from_features(
        {
            "bmi": bmi,
            "systolic_bp": payload.systolic_bp,
            "fasting_sugar": payload.fasting_sugar,
            "cholesterol": payload.cholesterol,
            "sleep_hours": payload.sleep_hours,
            "exercise_level": payload.exercise_level,
            "stress_level": payload.stress_level,
            "smoking": payload.smoking,
            "alcohol": payload.alcohol,
        }
    )
    twin.heart_score = scores["heart_score"]
    twin.metabolic_score = scores["metabolic_score"]
    twin.mental_stress_score = scores["mental_stress_score"]
    twin.organ_load_score = scores["organ_load_score"]

    db.add(twin)
    db.commit()
    db.refresh(twin)

    return twin


@router.get("/{user_id}", response_model=TwinRead)
def get_twin(user_id: int, db: Session = get_db()):
    twin = db.query(Twin).filter(Twin.user_id == user_id).first()
    if not twin:
        raise HTTPException(status_code=404, detail="Twin not found")
    return twin
