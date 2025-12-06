# app/api/alert_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.twin_schema import Twin
from app.utils.helpers import get_twin_or_404
from app.core.tracker import get_current_status
from app.core.alerts import get_alert_recommendation

router = APIRouter()


@router.get("/status/{user_id}")
def get_alert_status(user_id: int, db: Session = get_db()):
    twin = db.query(Twin).filter(Twin.user_id == user_id).first()
    twin = get_twin_or_404(db, twin.id)
    status = get_current_status(twin)
    alert = get_alert_recommendation(status)
    return {"user_id": user_id, "status": status, "alert": alert}
