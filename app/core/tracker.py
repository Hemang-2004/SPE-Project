# app/core/tracker.py
from typing import Dict
from app.database.twin_schema import Twin
from app.core.standards import get_personalized_standards

def get_current_status(twin: Twin) -> Dict[str, str]:
    """
    Compares current twin scores with personalized standards
    and returns a high-level classification.
    """
    standards = get_personalized_standards(twin.age, twin.gender)

    status = {}

    def classify(value: float, key: str) -> str:
        s = standards[key]
        if value <= s["safe_max"]:
            return "safe"
        elif value <= s["warn_max"]:
            return "warning"
        else:
            return "critical"

    status["systolic_bp"] = classify(twin.systolic_bp, "systolic_bp")
    status["fasting_sugar"] = classify(twin.fasting_sugar, "fasting_sugar")
    status["cholesterol"] = classify(twin.cholesterol, "cholesterol")
    status["heart_score"] = classify(twin.heart_score or 0.0, "heart_score")
    status["metabolic_score"] = classify(twin.metabolic_score or 0.0, "metabolic_score")
    status["mental_stress_score"] = classify(
        twin.mental_stress_score or 0.0, "mental_stress_score"
    )
    status["organ_load_score"] = classify(
        twin.organ_load_score or 0.0, "organ_load_score"
    )

    # global health label
    if "critical" in status.values():
        status["overall"] = "critical"
    elif "warning" in status.values():
        status["overall"] = "warning"
    else:
        status["overall"] = "safe"

    return status
