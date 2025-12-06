# app/database/simulation_schema.py
from sqlalchemy import Column, Integer, Float, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Dict, Any

from app.database.db import Base


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    twin_id = Column(Integer, ForeignKey("twins.id"), nullable=False)

    scenario_name = Column(String, nullable=False)
    duration_years = Column(Integer, nullable=False)

    # store result summary & curves as JSON
    result_summary = Column(JSON, nullable=True)

    twin = relationship("Twin")


class SimulationCreate(BaseModel):
    user_id: int
    twin_id: int
    scenario_name: str
    duration_years: int
    changes: Dict[str, Any]  # e.g. {"sleep_hours": -2, "smoking": +1}


class SimulationRead(BaseModel):
    id: int
    user_id: int
    twin_id: int
    scenario_name: str
    duration_years: int
    result_summary: Dict[str, Any]

    class Config:
        orm_mode = True
