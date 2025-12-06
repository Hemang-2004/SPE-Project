# app/ml/future_predictor.py
"""
Uses a simple ML-ish / parametric approach to produce
future health curves over N years.
"""

from typing import Dict, List
import math
from app.ml.health_score_model import compute_scores_from_features


def predict_future_health_curves(
    features: Dict[str, float],
    duration_years: int,
) -> List[Dict[str, float]]:
    """
    Returns a list of yearly health states.
    We simulate progressive damage or recovery depending on:
    - sleep
    - exercise
    - stress
    - smoking
    - alcohol
    - bmi
    """

    base_scores = compute_scores_from_features(features)
    curves = []

    # Lifestyle effect parameter
    lifestyle_factor = (
        0.05 * (7 - features["sleep_hours"]) +
        0.03 * features["stress_level"] -
        0.04 * features["exercise_level"] +
        0.05 * features["smoking"] +
        0.03 * features["alcohol"]
    )

    for year in range(1, duration_years + 1):
        multiplier = 1.0 + lifestyle_factor * year

        heart = min(1.0, base_scores["heart_score"] * multiplier)
        metabolic = min(1.0, base_scores["metabolic_score"] * multiplier)
        mental = min(1.0, base_scores["mental_stress_score"] * multiplier)
        organ = min(1.0, (heart + metabolic + mental) / 3.0)

        curves.append(
            {
                "year": year,
                "heart_score": heart,
                "metabolic_score": metabolic,
                "mental_stress_score": mental,
                "organ_load_score": organ,
            }
        )

    return curves
