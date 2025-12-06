# app/utils/risk_calculations.py
from math import pow

def calculate_heart_score(
    age: int,
    systolic_bp: float,
    diastolic_bp: float,
    resting_hr: float,
    smoking: int,
    exercise_level: int,
) -> float:
    score = 0.0
    score += max(0, (systolic_bp - 110) / 70) * 0.4
    score += max(0, (resting_hr - 60) / 60) * 0.3
    score += 0.1 * smoking
    score -= 0.05 * exercise_level
    score += max(0, (age - 40) / 40) * 0.2

    return min(1.0, max(0.0, score))


def calculate_metabolic_score(
    weight_kg: float,
    height_cm: float,
    fasting_sugar: float,
    cholesterol: float,
    sleep_hours: float,
) -> float:
    bmi = weight_kg / ((height_cm / 100) ** 2)
    score = 0.0
    score += max(0, (bmi - 23) / 15) * 0.4
    score += max(0, (fasting_sugar - 90) / 80) * 0.3
    score += max(0, (cholesterol - 180) / 120) * 0.2
    score += max(0, (7 - sleep_hours) / 5) * 0.1

    return min(1.0, max(0.0, score))


def calculate_mental_stress_score(
    stress_level: int,
    sleep_hours: float,
    screen_time_hours: float,
    alcohol: int,
) -> float:
    score = 0.0
    score += 0.25 * stress_level
    score += max(0, (7 - sleep_hours) / 5) * 0.3
    score += max(0, (screen_time_hours - 4) / 8) * 0.2
    score += 0.05 * alcohol

    return min(1.0, max(0.0, score))


def calculate_organ_load_score(
    heart_score: float,
    metabolic_score: float,
    mental_score: float,
) -> float:
    score = (heart_score + metabolic_score + mental_score) / 3.0
    return min(1.0, max(0.0, score))


def calculate_lung_risk(aqi: int, smoking: int, daily_steps: int) -> float:
    score = 0.0

    # AQI impact
    if aqi <= 50:
        score += 0.1
    elif aqi <= 100:
        score += 0.2
    elif aqi <= 150:
        score += 0.4
    elif aqi <= 200:
        score += 0.6
    else:
        score += 0.8

    # Smoking multiplier
    score += 0.2 * smoking

    # Walking protection
    if daily_steps > 7000:
        score -= 0.1
    elif daily_steps < 3000:
        score += 0.1

    return min(1.0, max(0.0, score))

def income_health_modifier(income: int) -> float:
    if income < 300000:
        return 1.15  # poor access to healthcare
    elif income < 600000:
        return 1.05
    elif income < 1200000:
        return 1.0
    else:
        return 0.95  # good healthcare access
