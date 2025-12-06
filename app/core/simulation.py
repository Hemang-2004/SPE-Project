# app/core/simulation.py
from typing import Dict, Any

from app.database.twin_schema import Twin
from app.core.environment import apply_environment_effects
from app.ml.future_predictor import predict_future_health_curves


def run_simulation(
    twin: Twin,
    duration_years: int,
    changes: Dict[str, Any],
    env_factors: Dict[str, int] | None = None,
) -> Dict[str, Any]:
    """
    ✅ Indian-realistic Digital Twin Simulation Engine

    - Applies lifestyle, income, and city pollution changes
    - Uses ML model to predict future health curves
    - Applies environmental amplification (pollution, work stress, noise)
    - Returns summary + year-by-year health timeline
    """

    # ✅ 1. BASE INPUT FEATURES (INITIAL DIGITAL HUMAN STATE)
    features = {
        "age": twin.age,
        "gender": 0 if twin.gender.lower().startswith("m") else 1,
        "bmi": twin.weight_kg / ((twin.height_cm / 100) ** 2),
        "sleep_hours": twin.sleep_hours,
        "exercise_level": twin.exercise_level,
        "stress_level": twin.stress_level,
        "smoking": twin.smoking,
        "alcohol": twin.alcohol,
        "screen_time_hours": twin.screen_time_hours,
        "fasting_sugar": twin.fasting_sugar,
        "systolic_bp": twin.systolic_bp,
        "cholesterol": twin.cholesterol,

        # ✅ INDIAN EXTENSIONS
        "aqi": twin.aqi or 120,
        "daily_steps": twin.daily_steps or 4000,
        "income": twin.income or 600000,
        "commute_hours": twin.commute_hours or 1.0,
        "ac_exposure_hours": twin.ac_exposure_hours or 4.0,
        "diet_type": twin.diet_type or "mixed",
        "outside_food_per_week": twin.outside_food_per_week or 3,
    }

    # ✅ 2. APPLY USER "WHAT-IF" CHANGES (SAFE & CONTROLLED)
    for k, v in changes.items():
        if k in features:
            if isinstance(v, (int, float)):
                features[k] += v   # numeric increments/decrements
            else:
                features[k] = v    # string replacements (diet_type, etc.)

    # ✅ SAFETY BOUNDS (IMPORTANT FOR REALISM)
    features["aqi"] = max(20, min(500, features["aqi"]))
    features["daily_steps"] = max(500, min(20000, features["daily_steps"]))
    features["sleep_hours"] = max(3.0, min(10.0, features["sleep_hours"]))
    features["income"] = max(50000, features["income"])

    # ✅ 3. PREDICT FUTURE BODY HEALTH USING ML
    curves = predict_future_health_curves(features, duration_years)

    # ✅ 4. APPLY ENVIRONMENTAL AMPLIFICATION PER YEAR
    pollution = (env_factors or {}).get("pollution_level", 1)
    work_stress = (env_factors or {}).get("work_stress", 1)
    noise = (env_factors or {}).get("noise_level", 1)

    adjusted_curves = []
    for point in curves:
        adjusted_scores = apply_environment_effects(
            {
                "heart_score": point["heart_score"],
                "mental_stress_score": point["mental_stress_score"],
                "organ_load_score": point["organ_load_score"],
            },
            pollution_level=pollution,
            work_stress=work_stress,
            noise_level=noise,
        )
        point.update(adjusted_scores)
        adjusted_curves.append(point)

    # ✅ 5. FINAL RISK SUMMARY
    final_state = adjusted_curves[-1]
    risk_level = "safe"

    if final_state["organ_load_score"] > 0.75:
        risk_level = "critical"
    elif final_state["organ_load_score"] > 0.5:
        risk_level = "warning"

    summary = {
        "risk_level": risk_level,
        "final_state": final_state,
        "years": duration_years,
        "simulation_inputs": features,   # ✅ VERY IMPORTANT FOR FRONTEND EXPLANATIONS
    }

    return {
        "summary": summary,
        "curves": adjusted_curves,
    }
