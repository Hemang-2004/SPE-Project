from app.database.twin_schema import Twin
from app.utils.risk_calculations import (
    calculate_heart_score,
    calculate_metabolic_score,
    calculate_mental_stress_score,
    calculate_organ_load_score,
    calculate_lung_risk,
    income_health_modifier,
)


def build_baseline_for_twin(twin: Twin) -> Twin:
    """
    Takes a Twin ORM object and fills in the baseline derived scores.
    This is called when a twin is created or updated.

    ✅ Includes:
    - Income-based healthcare access modifier
    - AQI + smoking + steps based lung risk
    - Indian lifestyle realism
    """

    # ✅ 1. Income-based modifier (healthcare access & recovery capacity)
    income_factor = income_health_modifier(twin.income or 600000)

    # ✅ 2. Heart Risk Score (Income-adjusted)
    twin.heart_score = calculate_heart_score(
        age=twin.age,
        systolic_bp=twin.systolic_bp,
        diastolic_bp=twin.diastolic_bp,
        resting_hr=twin.resting_hr,
        smoking=twin.smoking,
        exercise_level=twin.exercise_level,
    ) * income_factor

    # ✅ 3. Metabolic Risk Score (Income-adjusted)
    twin.metabolic_score = calculate_metabolic_score(
        weight_kg=twin.weight_kg,
        height_cm=twin.height_cm,
        fasting_sugar=twin.fasting_sugar,
        cholesterol=twin.cholesterol,
        sleep_hours=twin.sleep_hours,
    ) * income_factor

    # ✅ 4. Mental Stress Risk Score (Income-adjusted)
    twin.mental_stress_score = calculate_mental_stress_score(
        stress_level=twin.stress_level,
        sleep_hours=twin.sleep_hours,
        screen_time_hours=twin.screen_time_hours,
        alcohol=twin.alcohol,
    ) * income_factor

    # ✅ 5. Lung Risk Score (AQI + smoking + walking)
    twin.lung_risk_score = calculate_lung_risk(
        aqi=twin.aqi or 120,                     # default moderate pollution
        smoking=twin.smoking or 0,
        daily_steps=twin.daily_steps or 4000,   # default Indian average
    )

    # ✅ 6. Final Organ Load Score (Master Health Indicator)
    twin.organ_load_score = calculate_organ_load_score(
        heart_score=twin.heart_score,
        metabolic_score=twin.metabolic_score,
        mental_score=twin.mental_stress_score,
    )

    return twin
