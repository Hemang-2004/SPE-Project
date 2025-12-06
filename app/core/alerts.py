# app/core/alerts.py
from typing import Dict
from app.ml.alert_classifier import classify_alert_level

def get_alert_recommendation(status: Dict[str, str]) -> Dict[str, str]:
    """
    Uses ML-based classifier to decide if user needs
    no consult / routine / specialist / emergency.
    """

    level = classify_alert_level(status)

    mapping = {
        0: "none",
        1: "routine_consult",
        2: "specialist_consult",
        3: "emergency",
    }

    return {
        "alert_level": mapping.get(level, "none"),
        "explanation": (
            "Based on your current digital twin state and risk profile, "
            "this level of medical attention is recommended."
        ),
    }
