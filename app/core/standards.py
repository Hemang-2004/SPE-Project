# app/core/standards.py
from typing import Dict

def get_personalized_standards(age: int, gender: str) -> Dict[str, Dict[str, float]]:
    """
    Returns personalized safe / warning / critical levels
    for key parameters based on age and gender.
    Values are illustrative and can be refined.
    """
    standards = {}

    # Blood pressure
    if age < 30:
        standards["systolic_bp"] = {"safe_max": 120, "warn_max": 135, "critical_max": 150}
    elif age < 50:
        standards["systolic_bp"] = {"safe_max": 130, "warn_max": 145, "critical_max": 160}
    else:
        standards["systolic_bp"] = {"safe_max": 140, "warn_max": 155, "critical_max": 170}

    standards["diastolic_bp"] = {"safe_max": 85, "warn_max": 95, "critical_max": 110}
    standards["fasting_sugar"] = {"safe_max": 100, "warn_max": 120, "critical_max": 140}
    standards["cholesterol"] = {"safe_max": 200, "warn_max": 230, "critical_max": 260}
    standards["resting_hr"] = {"safe_max": 80, "warn_max": 95, "critical_max": 110}

    # Aggregate scores
    standards["heart_score"] = {"safe_max": 0.4, "warn_max": 0.7, "critical_max": 1.0}
    standards["metabolic_score"] = {"safe_max": 0.4, "warn_max": 0.7, "critical_max": 1.0}
    standards["mental_stress_score"] = {"safe_max": 0.4, "warn_max": 0.7, "critical_max": 1.0}
    standards["organ_load_score"] = {"safe_max": 0.5, "warn_max": 0.75, "critical_max": 1.0}

    return standards
