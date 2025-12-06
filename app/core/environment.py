# app/core/environment.py
from typing import Dict

def apply_environment_effects(
    current_scores: Dict[str, float],
    pollution_level: int = 1,
    work_stress: int = 1,
    noise_level: int = 1,
) -> Dict[str, float]:
    """
    Applies environment-based multipliers on current organ load.
    pollution_level, work_stress, noise_level: 0=low,1=moderate,2=high,3=extreme
    """

    env_factor = 1.0 + 0.05 * pollution_level + 0.05 * work_stress + 0.03 * noise_level

    adjusted = current_scores.copy()
    adjusted["heart_score"] *= env_factor
    adjusted["mental_stress_score"] *= (1.0 + 0.08 * work_stress + 0.02 * noise_level)
    adjusted["organ_load_score"] *= env_factor

    # Clip to 1.0 max
    for k in adjusted:
        adjusted[k] = min(1.0, adjusted[k])

    return adjusted
