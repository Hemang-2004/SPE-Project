# app/ml/health_score_model.py
"""
Simple ML helper to compute baseline scores.
For now we keep it rule-based with potential ML extension.
"""

from typing import Dict
import math

def compute_scores_from_features(features: Dict[str, float]) -> Dict[str, float]:
    """
    features may include:
    - bmi
    - systolic_bp
    - fasting_sugar
    - cholesterol
    - sleep_hours
    - exercise_level
    - stress_level
    - smoking
    - alcohol
    """

    bmi = features["bmi"]
    sbp = features["systolic_bp"]
    sugar = features["fasting_sugar"]
    chol = features["cholesterol"]
    sleep = features["sleep_hours"]
    exercise = features["exercise_level"]
    stress = features["stress_level"]
    smoking = features["smoking"]
    alcohol = features["alcohol"]

    # Normalize values to 0–1 risk scores (very rough)
    heart_score = 0.0
    heart_score += max(0, (sbp - 110) / 70) * 0.4
    heart_score += max(0, (bmi - 22) / 15) * 0.3
    heart_score += 0.1 * smoking
    heart_score += 0.05 * alcohol
    heart_score = min(1.0, heart_score)

    metabolic_score = 0.0
    metabolic_score += max(0, (sugar - 90) / 70) * 0.4
    metabolic_score += max(0, (bmi - 23) / 15) * 0.4
    metabolic_score += max(0, (chol - 180) / 120) * 0.2
    metabolic_score = min(1.0, metabolic_score)

    mental_stress_score = 0.0
    mental_stress_score += 0.25 * stress
    mental_stress_score += max(0, (7 - sleep) / 5) * 0.4
    mental_stress_score += 0.05 * alcohol
    mental_stress_score = min(1.0, mental_stress_score)

    organ_load_score = (heart_score + metabolic_score + mental_stress_score) / 3.0
    organ_load_score = min(1.0, organ_load_score)

    return {
        "heart_score": heart_score,
        "metabolic_score": metabolic_score,
        "mental_stress_score": mental_stress_score,
        "organ_load_score": organ_load_score,
    }
