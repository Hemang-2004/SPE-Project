# app/ml/nutrition_recommender.py
from typing import Dict, Any
import math

def get_nutrition_plan(
    age: int,
    weight_kg: float,
    height_cm: float,
    metabolic_score: float,
    activity_level: int,
    stress_level: int,
) -> Dict[str, Any]:
    """
    Simple approximate nutrition recommender.
    You can replace with ML later.
    """

    bmi = weight_kg / ((height_cm / 100) ** 2)
    base_calories = 24 * weight_kg  # rough BMR

    activity_multiplier = 1.2 + 0.15 * activity_level
    stress_multiplier = 1.0 + 0.05 * stress_level

    target_calories = base_calories * activity_multiplier / stress_multiplier

    # macronutrient split based on metabolic risk
    if metabolic_score < 0.4:
        carbs_pct, protein_pct, fat_pct = 0.5, 0.25, 0.25
    elif metabolic_score < 0.7:
        carbs_pct, protein_pct, fat_pct = 0.4, 0.3, 0.3
    else:
        carbs_pct, protein_pct, fat_pct = 0.3, 0.35, 0.35

    carbs = target_calories * carbs_pct / 4
    protein = target_calories * protein_pct / 4
    fats = target_calories * fat_pct / 9

    plan = {
        "target_calories": round(target_calories),
        "macros": {
            "carbs_g": round(carbs),
            "protein_g": round(protein),
            "fats_g": round(fats),
        },
        "notes": [],
    }

    if bmi > 27:
        plan["notes"].append("Reduce refined carbs and sugars.")
    if metabolic_score > 0.7:
        plan["notes"].append("Limit saturated fats and late-night eating.")
    if stress_level > 1:
        plan["notes"].append("Include magnesium-rich and omega-3 foods.")

    return plan
