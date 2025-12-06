# app/api/simulation_routes.py
from fastapi import APIRouter
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.db import get_db
from app.database.simulation_schema import SimulationRun, SimulationCreate, SimulationRead
from app.database.twin_schema import Twin
from app.utils.helpers import get_twin_or_404
from app.core.simulation import run_simulation

router = APIRouter()


@router.post("/run", response_model=SimulationRead)
def simulate(payload: SimulationCreate, db: Session = get_db()):
    twin = get_twin_or_404(db, payload.twin_id)

    result = run_simulation(
        twin=twin,
        duration_years=payload.duration_years,
        changes=payload.changes,
    )

    sim = SimulationRun(
        user_id=payload.user_id,
        twin_id=payload.twin_id,
        scenario_name=payload.scenario_name,
        duration_years=payload.duration_years,
        result_summary=result,
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)

    return sim


@router.get("/result/{simulation_id}", response_model=SimulationRead)
def get_simulation(simulation_id: int, db: Session = get_db()):
    sim = db.query(SimulationRun).filter(SimulationRun.id == simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


@router.get("/history/{user_id}")
def get_simulation_history(user_id: int, db: Session = get_db()):
    sims = (
        db.query(SimulationRun)
        .filter(SimulationRun.user_id == user_id)
        .order_by(SimulationRun.id.desc())
        .all()
    )
    return sims
