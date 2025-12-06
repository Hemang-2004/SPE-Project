import os
import json
from datetime import datetime
from typing import Dict, List, Optional

import numpy as np
import mlflow
import mlflow.sklearn

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split

from joblib import dump, load

from app.database.db import SessionLocal
from app.database.twin_schema import Twin


MODELS_DIR = "models"
META_PATH = os.path.join(MODELS_DIR, "models_meta.json")


# =========================
# FILE + META HELPERS
# =========================

def _ensure_dirs():
    os.makedirs(MODELS_DIR, exist_ok=True)
    if not os.path.exists(META_PATH):
        with open(META_PATH, "w") as f:
            json.dump({"models": []}, f)


def _load_meta() -> Dict:
    _ensure_dirs()
    with open(META_PATH, "r") as f:
        return json.load(f)


def _save_meta(meta: Dict):
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)


def get_registered_models() -> List[Dict]:
    return _load_meta().get("models", [])


def get_active_model_path() -> Optional[str]:
    meta = _load_meta().get("models", [])
    active = [m for m in meta if m.get("active")]
    if not active:
        return None
    return active[-1]["path"]


def get_active_model_info() -> Optional[Dict]:
    meta = _load_meta().get("models", [])
    for m in reversed(meta):
        if m.get("active"):
            return m
    return None


# =========================
# FEATURE ENCODERS
# =========================

def _encode_gender(g):
    if not g:
        return 0
    g = g.lower()
    if g.startswith("m"):
        return 0
    if g.startswith("f"):
        return 1
    return 2


def _encode_diet(d):
    if not d:
        return 3
    d = d.lower()
    if "veg" in d and "non" not in d:
        return 0
    if "egg" in d:
        return 1
    if "non" in d:
        return 2
    return 3


# =========================
# FEATURE VECTOR
# =========================

def _build_feature_vector(t: Twin) -> List[float]:
    bmi = t.weight_kg / ((t.height_cm / 100) ** 2)

    return [
        t.age,
        _encode_gender(t.gender),
        bmi,
        t.spo2 or 97,
        t.resting_hr or 72,

        t.sleep_hours or 7,
        t.screen_time_hours or 6,
        t.exercise_level or 1,
        t.smoking or 0,
        t.alcohol or 0,

        t.daily_steps or 4000,
        t.outside_food_per_week or 3,
        t.tea_coffee_per_day or 2,
        _encode_diet(t.diet_type),

        t.income or 600000,
        t.aqi or 120,
        t.commute_hours or 1.0,
        t.ac_exposure_hours or 4.0,

        t.heart_score or 0.3,
        t.metabolic_score or 0.3,
        t.mental_stress_score or 0.3,
        t.lung_risk_score or 0.3,
        t.organ_load_score or 0.4,
    ]


def _build_label(t: Twin) -> int:
    ol = t.organ_load_score or 0.0
    if ol < 0.4:
        return 0
    elif ol < 0.6:
        return 1
    elif ol < 0.8:
        return 2
    else:
        return 3


# =========================
# LOAD DATA FROM DB
# =========================

def _load_training_data_from_db():
    db = SessionLocal()
    twins = db.query(Twin).all()
    db.close()

    if len(twins) < 10:
        raise ValueError("Not enough twins to train model.")

    X, y = [], []
    for t in twins:
        X.append(_build_feature_vector(t))
        y.append(_build_label(t))

    return np.array(X), np.array(y)


# =========================
# FULL MLOPS RETRAIN
# =========================

def retrain_alert_model() -> Dict:
    _ensure_dirs()
    X, y = _load_training_data_from_db()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=42
    )

    mlflow.set_experiment("bodytwin_alert_models")

    models = {
        "logreg": LogisticRegression(max_iter=2000, multi_class="multinomial"),
        "rf": RandomForestClassifier(n_estimators=200),
        "gb": GradientBoostingClassifier(),
    }

    best_model_path = None
    best_f1 = -1
    best_acc = 0
    best_key = None
    best_run = None

    for key, clf in models.items():
        with mlflow.start_run(run_name=f"alert_{key}") as run:
            pipe = Pipeline([
                ("scaler", StandardScaler()),
                ("clf", clf),
            ])

            pipe.fit(X_train, y_train)
            preds = pipe.predict(X_test)

            acc = accuracy_score(y_test, preds)
            f1 = f1_score(y_test, preds, average="macro")

            mlflow.log_metric("accuracy", acc)
            mlflow.log_metric("f1_macro", f1)
            mlflow.log_param("model", key)

            timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
            model_path = os.path.join(MODELS_DIR, f"alert_{key}_{timestamp}.joblib")
            dump(pipe, model_path)
            mlflow.sklearn.log_model(pipe, artifact_path=f"model_{key}")

            if f1 > best_f1:
                best_f1 = f1
                best_acc = acc
                best_model_path = model_path
                best_key = key
                best_run = run.info.run_id

    meta = _load_meta()
    for m in meta["models"]:
        m["active"] = False

    meta["models"].append({
        "name": os.path.basename(best_model_path),
        "path": best_model_path,
        "model_type": best_key,
        "accuracy": best_acc,
        "f1_macro": best_f1,
        "mlflow_run_id": best_run,
        "created_at": datetime.utcnow().isoformat(),
        "active": True,
    })

    _save_meta(meta)

    return {
        "status": "trained_on_real_db",
        "best_model": best_key,
        "accuracy": best_acc,
        "f1_macro": best_f1,
        "model_path": best_model_path,
        "mlflow_run_id": best_run,
    }


# =========================
# PREDICTION USING ACTIVE MODEL
# =========================

def predict_alert_for_twin(twin: Twin) -> Dict:
    path = get_active_model_path()
    if not path:
        return {"error": "No active model found"}

    model = load(path)
    features = np.array([_build_feature_vector(twin)])
    pred = int(model.predict(features)[0])

    labels = {
        0: "no_consult",
        1: "routine_consult",
        2: "specialist_consult",
        3: "emergency",
    }

    return {
        "class_id": pred,
        "label": labels[pred],
    }
