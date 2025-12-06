# app/database/twin_schema.py
from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional

from app.database.db import Base
from app.database.user_schema import UserRead


class Twin(Base):
    __tablename__ = "twins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)

    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    fasting_sugar = Column(Float, nullable=True)
    resting_hr = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    cholesterol = Column(Float, nullable=True)
    income = Column(Integer, nullable=True)

    city = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    work_type = Column(String, nullable=True)  # desk / field / mixed
    commute_hours = Column(Float, nullable=True)
    ac_exposure_hours = Column(Float, nullable=True)

    diet_type = Column(String, nullable=True)  # veg / egg / nonveg
    daily_steps = Column(Integer, nullable=True)
    tea_coffee_per_day = Column(Integer, nullable=True)
    outside_food_per_week = Column(Integer, nullable=True)
    aqi = Column(Integer, nullable=True)
    lung_risk_score = Column(Float, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    exercise_level = Column(Integer, nullable=True)  # 0–3
    stress_level = Column(Integer, nullable=True)    # 0–3
    smoking = Column(Integer, nullable=True)         # 0/1
    alcohol = Column(Integer, nullable=True)         # 0–3
    screen_time_hours = Column(Float, nullable=True)
    name = Column(String, nullable=False)
    # Derived scores
    heart_score = Column(Float, nullable=True)
    metabolic_score = Column(Float, nullable=True)
    mental_stress_score = Column(Float, nullable=True)
    organ_load_score = Column(Float, nullable=True)
    
    

    user = relationship("User")


class TwinCreate(BaseModel):
    user_id: int

    age: int
    gender: str
    height_cm: float
    weight_kg: float
    name: str
    systolic_bp: float
    diastolic_bp: float
    fasting_sugar: float
    resting_hr: float
    spo2: float
    cholesterol: float
    
    sleep_hours: float
    exercise_level: int
    stress_level: int
    smoking: int
    alcohol: int
    screen_time_hours: float

    # ✅ NEW INDIAN + ENVIRONMENT + INCOME FIELDS
    income: Optional[int] = None

    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    work_type: Optional[str] = None          # desk / field / mixed
    commute_hours: Optional[float] = None
    ac_exposure_hours: Optional[float] = None

    diet_type: Optional[str] = None          # veg / egg / nonveg
    daily_steps: Optional[int] = None
    tea_coffee_per_day: Optional[int] = None
    outside_food_per_week: Optional[int] = None

    aqi: Optional[int] = None                # from Google Maps / AQI API

class TwinRead(BaseModel):
    id: int
    user_id: int
    name: str
    age: int
    gender: str
    height_cm: float
    weight_kg: float

    systolic_bp: float
    diastolic_bp: float
    fasting_sugar: float
    resting_hr: float
    spo2: float
    cholesterol: float

    sleep_hours: float
    exercise_level: int
    stress_level: int
    smoking: int
    alcohol: int
    screen_time_hours: float

    # ✅ NEW INDIAN + ENVIRONMENT + INCOME FIELDS
    income: Optional[int]

    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

    work_type: Optional[str]
    commute_hours: Optional[float]
    ac_exposure_hours: Optional[float]

    diet_type: Optional[str]
    daily_steps: Optional[int]
    tea_coffee_per_day: Optional[int]
    outside_food_per_week: Optional[int]

    aqi: Optional[int]
    lung_risk_score: Optional[float]

    # ✅ DERIVED HEALTH SCORES
    heart_score: Optional[float]
    metabolic_score: Optional[float]
    mental_stress_score: Optional[float]
    organ_load_score: Optional[float]

    class Config:
        orm_mode = True

    class Config:
        orm_mode = True
