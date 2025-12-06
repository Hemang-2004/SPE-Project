from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.twin_schema import Twin
from app.ml.model_manager import (
    retrain_alert_model,
    get_registered_models,
    get_active_model_path,
    get_active_model_info,
    predict_alert_for_twin,
)

router = APIRouter()


@router.post("/retrain")
def retrain():
    """
    Full MLOps retraining on REAL Twin DB:
    - multi-model
    - MLflow tracked
    - best model auto-promoted
    """
    return retrain_alert_model()


@router.get("/models")
def list_models():
    return {"models": get_registered_models()}


@router.get("/model-status")
def model_status():
    active = get_active_model_info()
    return {"active_model": active}


@router.get("/predict-alert/{user_id}")
def predict_alert(user_id: int, db: Session = Depends(get_db)):
    twin = db.query(Twin).filter(Twin.user_id == user_id).first()
    if not twin:
        raise HTTPException(status_code=404, detail="Twin not found")

    result = predict_alert_for_twin(twin)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "user_id": user_id,
        "name": twin.name,
        "city": twin.city,
        "aqi": twin.aqi,
        "income": twin.income,
        "scores": {
            "heart": twin.heart_score,
            "metabolic": twin.metabolic_score,
            "mental": twin.mental_stress_score,
            "lung": twin.lung_risk_score,
            "organ_load": twin.organ_load_score,
        },
        "alert_prediction": result,
    }
