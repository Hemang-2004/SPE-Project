# app/core/nutrition.py
from typing import Dict, Any
from app.database.twin_schema import Twin
from app.ml.nutrition_recommender import get_nutrition_plan

def build_nutrition_recommendation(twin: Twin) -> Dict[str, Any]:
    """
    Wrapper that calls ML / rules-based engine to produce
    a structured nutrition recommendation.
    """
    plan = get_nutrition_plan(
        age=twin.age,
        weight_kg=twin.weight_kg,
        height_cm=twin.height_cm,
        metabolic_score=twin.metabolic_score or 0.5,
        activity_level=twin.exercise_level or 1,
        stress_level=twin.stress_level or 1,
    )

    return plan
