# app/ml/alert_classifier.py
"""
Alert classifier. For now rule-based,
can be replaced by a real ML model later.
"""

from typing import Dict

def classify_alert_level(status: Dict[str, str]) -> int:
    """
    Map status dict to alert level.
    0: no alert
    1: routine consult
    2: specialist consult
    3: emergency
    """

    overall = status.get("overall", "safe")

    if overall == "critical":
        # if multiple critical parameters -> emergency
        critical_count = sum(1 for v in status.values() if v == "critical")
        if critical_count >= 2:
            return 3
        return 2
    elif overall == "warning":
        return 1
    else:
        return 0
