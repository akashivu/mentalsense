from typing import Any, Dict, List, Optional
from pathlib import Path
import logging
import math

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model

from ml_service.utils.keystroke_features import extract_features_from_raw
from ml_service.nlp.roberta_emotion import analyze_text
from ml_service.nlp.score_text import compute_text_metrics, normalize
from ml_service.timeseries.train_lstm_user import (
    train_user_lstm,
    predict_future_from_model,
    MODEL_DIR as LSTM_MODEL_DIR,
)
from ml_service.timeseries.train_anomaly_user import predict_user_anomaly
from fastapi import BackgroundTasks


app = FastAPI(title="MentalSense ML Service")
logger = logging.getLogger("ml_service")




HERE = Path(__file__).resolve().parent


MODEL_DIR_CANDIDATES = [
    HERE / "models",
    HERE.parent / "models",
    HERE.parent.parent / "models",
]
MODEL_DIR = next((p for p in MODEL_DIR_CANDIDATES if p.exists()), MODEL_DIR_CANDIDATES[1])


MODEL_PATH = MODEL_DIR / "keystroke_rf.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"

if not MODEL_PATH.exists() or not SCALER_PATH.exists():
    raise RuntimeError(
        f"Model or scaler not found. Looked at: {MODEL_DIR}. "
        f"Ensure keystroke_rf.pkl and scaler.pkl exist there."
    )

clf = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)


ISO_PATH = MODEL_DIR / "isoforest.pkl"
iso: Optional[IsolationForest] = None
try:
    if ISO_PATH.exists():
        iso = joblib.load(ISO_PATH)
        logger.info(
            "IsolationForest loaded from %s (n_features_in_=%s)",
            ISO_PATH,
            getattr(iso, "n_features_in_", None),
        )
    else:
        logger.warning("IsolationForest file not found at %s — iso left as None", ISO_PATH)
except Exception as e:
    iso = None
    logger.exception("Failed to load IsolationForest from %s: %s", ISO_PATH, e)


TS_MODEL_DIR = HERE.parent / "models"  
TS_MODEL_DIR.mkdir(exist_ok=True)

GLOBAL_LSTM_PATH = TS_MODEL_DIR / "lstm_stress.h5"
GLOBAL_SCALER_PATH = TS_MODEL_DIR / "scaler.pkl"

lstm: Optional[Any] = None
global_scaler: Optional[StandardScaler] = None
SEQ_LEN = 10
N_STEPS = 5


@app.on_event("startup")
def load_global_lstm_and_scaler() -> None:
    """Load global LSTM + scaler for /predict/trend on startup."""
    global lstm, global_scaler

    
    try:
        if GLOBAL_LSTM_PATH.exists():
            lstm = load_model(str(GLOBAL_LSTM_PATH), compile=False)
            logger.info("[GLOBAL] Loaded LSTM from %s", GLOBAL_LSTM_PATH)
        else:
            logger.warning("[GLOBAL] LSTM file not found at %s", GLOBAL_LSTM_PATH)
            lstm = None
    except Exception as e:
        logger.exception("[GLOBAL] Failed to load LSTM: %s", e)
        lstm = None

    
    try:
        if GLOBAL_SCALER_PATH.exists():
            global_scaler = joblib.load(GLOBAL_SCALER_PATH)
            logger.info("[GLOBAL] Loaded scaler from %s", GLOBAL_SCALER_PATH)
        else:
            logger.warning("[GLOBAL] Scaler file not found at %s", GLOBAL_SCALER_PATH)
            global_scaler = None
    except Exception as e:
        logger.exception("[GLOBAL] Failed to load scaler: %s", e)
        global_scaler = None




class TextRequest(BaseModel):
    text: str


class EventItem(BaseModel):
    event_times: list
    raw_text: str = ""


class TrendRequest(BaseModel):
    past_values: list


class AnomalyRequest(BaseModel):
    value: Optional[float] = None
    features: Optional[List[float]] = None

    def first_feature_vector(self) -> np.ndarray:
        if self.features is not None:
            return np.array([list(map(float, self.features))], dtype=float)
        if self.value is not None:
            return np.array([[float(self.value)]], dtype=float)
        raise ValueError("Request must include either 'value' or 'features'.")


class CombinedRequest(BaseModel):
    event_times: list = None
    keystroke_features: dict = None
    raw_text: str = ""


class TrendUserRequest(BaseModel):
    past_values: list


class AnomalyUserRequest(BaseModel):
    value: Optional[float] = None


class TrendUserPayload(BaseModel):
    user_id: int
    past_values: List[float]
    seq_len: Optional[int] = 10
    n_steps: Optional[int] = 5


class AnomalyUserPayload(BaseModel):
    user_id: int
    value: Optional[float] = None
    features: Optional[List[float]] = None
    multi_features: Optional[List[List[float]]] = None
    use_scaler_if_exists: Optional[bool] = True




@app.post("/predict/emotion_text")
def predict_emotion_text(payload: TextRequest):
    try:
        res = analyze_text(payload.text)
        return {"ok": True, "result": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@app.post("/predict/keystroke")
def predict_keystroke(payload: EventItem):
    try:
        ev = payload.event_times or []

        normalized_ev = []

        def safe_key(k):
            try:
                if k is None:
                    return "key"
                return str(k)
            except Exception:
                return "key"

        if len(ev) == 0:
            normalized_ev = []
        else:
            first = ev[0]

            if isinstance(first, (int, float, str)):
                for t in ev:
                    try:
                        tt = float(t)
                        normalized_ev.append(("key", tt, tt))
                    except Exception:
                        continue

            elif isinstance(first, (list, tuple)):
                for item in ev:
                    try:
                        if len(item) >= 3:
                            k = safe_key(item[0])
                            normalized_ev.append((k, float(item[1]), float(item[2])))
                        elif len(item) == 2:
                            normalized_ev.append(("key", float(item[0]), float(item[1])))
                        elif len(item) == 1:
                            v = float(item[0])
                            normalized_ev.append(("key", v, v))
                    except Exception:
                        continue

            elif isinstance(first, dict):
                for item in ev:
                    try:
                        k = safe_key(item.get("key"))

                        if "down" in item or "up" in item:
                            down = float(item.get("down", item.get("time")))
                            up = float(item.get("up", down))
                            normalized_ev.append((k, down, up))
                        elif "time" in item:
                            t = float(item["time"])
                            normalized_ev.append((k, t, t))
                    except Exception:
                        continue

            else:
                for it in ev:
                    try:
                        t = float(it)
                        normalized_ev.append(("key", t, t))
                    except Exception:
                        continue

        feats = extract_features_from_raw(normalized_ev, None, payload.raw_text)

        feature_order = [
            "typing_speed", "avg_hold_ms", "std_hold_ms", "avg_interkey_ms",
            "backspace_rate", "punctuation_rate", "uppercase_rate",
            "digit_rate", "char_count"
        ]

        X = np.array([[feats[k] for k in feature_order]])
        Xs = scaler.transform(X)
        prob = float(clf.predict_proba(Xs)[0, 1])

        return {
            "label": int(prob > 0.5),
            "stress_score": prob,
            "confidence": prob
        }

    except Exception as e:
        logger.exception("predict_keystroke failed")
        raise HTTPException(status_code=500, detail=str(e))




@app.post("/predict/trend")
def predict_trend(payload: TrendRequest):
    global lstm, global_scaler

    # ---------- Fallback if if model not loaded ----------
    if lstm is None:
        logger.warning("LSTM not loaded — returning fallback trend values")

        vals: List[float] = []
        try:
            raw = payload.past_values[-SEQ_LEN:]
            for v in raw:
                if v is None:
                    continue
                vals.append(float(v))
        except Exception:
            pass

        while len(vals) < SEQ_LEN:
            vals.insert(0, 0.0)

        last = vals[-1] if vals else 0.0
        future = [last + 0.02 * (i + 1) for i in range(N_STEPS)]

        return JSONResponse(
            {"past": vals, "future": future, "note": "fallback_no_lstm"},
            status_code=200,
        )

   
    vals: List[float] = []
    try:
        for v in payload.past_values or []:
            if v is None:
                continue
            vals.append(float(v))
    except Exception:
        pass

    if not vals:
        return JSONResponse(
            {"past": [], "future": [], "note": "no_valid_values"},
            status_code=200,
        )

    arr = np.array(vals, dtype=float)

    if len(arr) >= SEQ_LEN:
        window_unscaled = arr[-SEQ_LEN:]
    else:
        pad = np.zeros(SEQ_LEN - len(arr), dtype=float)
        window_unscaled = np.concatenate([pad, arr])

    past_for_response = window_unscaled.tolist()

    def scale_window(win: np.ndarray) -> np.ndarray:
        return win


    prev = window_unscaled.reshape(1, SEQ_LEN, 1)


    future: List[float] = []
    for _ in range(N_STEPS):
        pred = float(lstm.predict(prev, verbose=0)[0, 0])
        future.append(pred)

        window_unscaled = np.append(window_unscaled[1:], pred)
        prev = window_unscaled.reshape(1, SEQ_LEN, 1)


    return JSONResponse(
        {"past": past_for_response, "future": future, "note": "lstm_global"},
        status_code=200,
    )



#  Global Anomaly (IsolationForest)


@app.post("/predict/anomaly")
def predict_anomaly(payload: AnomalyRequest):
    global iso, logger, scaler

    if iso is None:
        return JSONResponse({"error": "IsolationForest not loaded"}, status_code=500)

    try:
        X = payload.first_feature_vector()
    except Exception as e:
        logger.exception("Invalid anomaly payload")
        raise HTTPException(status_code=400, detail=str(e))

    if not np.all(np.isfinite(X)):
        raise HTTPException(status_code=400, detail="Non-finite numeric values in input")

    n_iso = getattr(iso, "n_features_in_", None)
    n_scaler = getattr(scaler, "n_features_in_", None)

    try:
        if n_iso is not None and X.shape[1] == n_iso:
            pred = iso.predict(X)[0]

        elif n_scaler is not None and X.shape[1] == n_scaler:
            Xs = scaler.transform(X)
            if n_iso is None or Xs.shape[1] == n_iso:
                pred = iso.predict(Xs)[0]
            else:
                X_for_iso = Xs[:, :n_iso]
                pred = iso.predict(X_for_iso)[0]

        elif n_scaler is not None and X.shape[1] < n_scaler:
            mean = getattr(scaler, "mean_", None)
            if mean is None or len(mean) != n_scaler:
                raise HTTPException(status_code=500, detail="Scaler mean not available for padding")

            full = np.array([mean], dtype=float)
            full[0, : X.shape[1]] = X.flatten()
            Xs = scaler.transform(full)

            if n_iso is None or Xs.shape[1] == n_iso:
                pred = iso.predict(Xs)[0]
            else:
                X_for_iso = Xs[:, :n_iso]
                pred = iso.predict(X_for_iso)[0]

        else:
            logger.warning(
                "Anomaly input size mismatch. X.shape=%s, iso.n_features=%s, scaler.n_features=%s",
                X.shape, n_iso, n_scaler
            )
            pred = iso.predict(X)[0]

    except Exception as e:
        logger.exception("IsolationForest prediction failed")
        raise HTTPException(status_code=500, detail=f"isoforest predict failed: {e}")

    return {"anomaly": int(pred)}



#     Combined Text + Keystroke


@app.post("/predict/combined")
def predict_combined(payload: CombinedRequest):
    text_metrics = compute_text_metrics(payload.raw_text or "")

    if payload.keystroke_features:
        kf = payload.keystroke_features
        keystroke_score = float(kf.get("stress_score", 0.0)) if "stress_score" in kf else 0.0
    elif payload.event_times:
        feats = extract_features_from_raw(payload.event_times, None, payload.raw_text or "")
        ks = 0.0
        ks += min(1.0, feats.get("backspace_rate", 0.0) / 20.0) * 0.6
        ks += min(1.0, (feats.get("avg_interkey_ms", 0.0)) / 300.0) * 0.3
        ks += min(1.0, (feats.get("std_hold_ms", 0.0)) / 200.0) * 0.1
        keystroke_score = normalize(ks, 0.0, 1.0)
    else:
        keystroke_score = 0.0

    combined = 0.65 * text_metrics["text_stress_score"] + 0.35 * keystroke_score
    combined = normalize(combined, 0.0, 1.0)

    return {
        "text_metrics": text_metrics,
        "keystroke_score": float(keystroke_score),
        "combined_stress_score": float(combined),
    }



#      Peruser LSTM + anomaly routes


MODELS_DIR = LSTM_MODEL_DIR  


def train_user_isoforest(user_id: int, values, contamination: float = 0.07) -> Dict[str, Any]:
    """Train & save IsolationForest model for one user (per-user anomaly)."""
    try:
        arr = np.array(values).reshape(-1, 1)
        user_iso = IsolationForest(contamination=contamination, random_state=42)
        user_iso.fit(arr)

        path = MODELS_DIR / f"user_{user_id}_isoforest.pkl"
        joblib.dump(user_iso, path)
        return {"success": True, "model_path": str(path)}

    except Exception as e:
        logger.exception("ISO train failed for user=%s : %s", user_id, e)
        return {"success": False, "message": str(e)}


@app.post("/user/{user_id}/train-models")
def train_models_for_user(user_id: int, payload: dict):
    values = payload.get("values")
    if not values:
        raise HTTPException(status_code=400, detail="values required")

    seq_len = int(payload.get("seq_len", 10))
    epochs = int(payload.get("epochs", 25))
    train_iso_flag = bool(payload.get("train_iso", True))
    scale = bool(payload.get("scale", True))

    lstm_res = train_user_lstm(
        user_id,
        values,
        seq_len=seq_len,
        epochs=epochs,
        scale=scale,
        verbose=0,
    )

    iso_res = None
    if train_iso_flag:
        iso_res = train_user_isoforest(user_id, values)

    return {
        "ok": True,
        "lstm": lstm_res,
        "iso": iso_res,
    }


@app.post("/user/{user_id}/trend")
def trend_user(user_id: int, payload: TrendUserRequest):
    res = predict_future_from_model(
        user_id=user_id,
        past_values=payload.past_values,
        n_steps=5,
        seq_len=10,
    )

    if res["success"]:
        return {"ok": True, "past": res["past"], "future": res["future"]}

    vals: List[float] = []
    raw = payload.past_values[-10:]
    for v in raw:
        try:
            vals.append(float(v))
        except Exception:
            continue
    while len(vals) < 10:
        vals.insert(0, 0.0)
    last = vals[-1]
    fallback_future = [last + 0.02 * (i + 1) for i in range(5)]

    return {
        "ok": True,
        "past": vals,
        "future": fallback_future,
        "note": "fallback_no_lstm",
    }


@app.post("/user/{user_id}/anomaly")
def anomaly_user(user_id: int, payload: AnomalyUserRequest):
    user_iso_path = MODELS_DIR / f"user_{user_id}_isoforest.pkl"

    if not user_iso_path.exists():
        raise HTTPException(status_code=404, detail="User IsolationForest model not trained")

    iso_model: IsolationForest = joblib.load(user_iso_path)

    X = np.array([[payload.value]], dtype=float)
    pred = iso_model.predict(X)[0]

    return {"ok": True, "anomaly": int(pred)}


@app.post("/trend/user")
def ml_trend_user(payload: TrendUserPayload):
    try:
        uid = int(payload.user_id)
        past = payload.past_values or []
        seq_len = int(payload.seq_len or 10)
        n_steps = int(payload.n_steps or 5)

        res = predict_future_from_model(
            user_id=uid,
            past_values=past,
            n_steps=n_steps,
            seq_len=seq_len,
        )
        if not res.get("success"):
            return {
                "ok": False,
                "message": res.get("message"),
                "past": res.get("past", []),
                "future": res.get("future", []),
            }

        return {"ok": True, "past": res.get("past", []), "future": res.get("future", [])}
    except Exception as e:
        logger.exception("ml_trend_user failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/anomaly/user")
def ml_anomaly_user(payload: AnomalyUserPayload):
    try:
        uid = int(payload.user_id)
        use_scaler = bool(payload.use_scaler_if_exists)

        if payload.multi_features is not None:
            X = payload.multi_features
        elif payload.features is not None:
            X = [payload.features]
        elif payload.value is not None:
            X = [[float(payload.value)]]
        else:
            raise HTTPException(status_code=400, detail="Provide 'value' or 'features' or 'multi_features'")

        r = predict_user_anomaly(uid, X, use_scaler_if_exists=use_scaler)
        if not r.get("success"):
            return {
                "ok": False,
                "message": r.get("message"),
                "prediction": r.get("prediction", []),
            }
        return {"ok": True, "prediction": r.get("prediction", [])}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("ml_anomaly_user failed")
        raise HTTPException(status_code=500, detail=str(e))
