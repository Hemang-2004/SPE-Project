# app/api/tracker_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.utils.helpers import get_twin_or_404
from app.database.twin_schema import Twin
from app.core.tracker import get_current_status

router = APIRouter()


@router.get("/current/{user_id}")
def current_status(user_id: int, db: Session = get_db()):
    twin = db.query(Twin).filter(Twin.user_id == user_id).first()
    twin = get_twin_or_404(db, twin.id)
    status = get_current_status(twin)
    return {"user_id": user_id, "status": status}
