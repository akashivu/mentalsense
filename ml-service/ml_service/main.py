
from typing import List, Optional
from pathlib import Path
import math
import logging

import joblib
import numpy as np
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.responses import JSONResponse

from ml_service.utils.keystroke_features import extract_features_from_raw
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ml_service.nlp.roberta_emotion import analyze_text

app = FastAPI(title="MentalSense ML Service")

class TextRequest(BaseModel):
    text: str

@app.post("/predict/emotion_text")
def predict_emotion_text(payload: TextRequest):
    try:
        res = analyze_text(payload.text)
        return {"ok": True, "result": res}
    except Exception as e:
       
        raise HTTPException(status_code=500, detail=str(e))

lstm = None
iso = None


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
iso = None
try:
    if ISO_PATH.exists():
        iso = joblib.load(ISO_PATH)
        logger.info("IsolationForest loaded from %s (n_features_in_=%s)", ISO_PATH, getattr(iso, "n_features_in_", None))
    else:
        logger.warning("IsolationForest file not found at %s — iso left as None", ISO_PATH)
except Exception as e:
    iso = None
    logger.exception("Failed to load IsolationForest from %s: %s", ISO_PATH, e)


class EventItem(BaseModel):
    event_times: list
    raw_text: str = ""


class TrendRequest(BaseModel):
    past_values: list


class AnomalyRequest(BaseModel):
    """
    Accepts either:
      - single `value` (float) when your IsolationForest was trained on 1 feature, OR
      - `features` (list of floats) when model expects multiple features.
    """
    value: Optional[float] = None
    features: Optional[List[float]] = None

    def first_feature_vector(self) -> np.ndarray:
        """
        Returns a 2D numpy array shaped (1, n_features) for sklearn.
        Prefers `features` if provided; otherwise uses single `value`.
        """
        if self.features is not None:
            return np.array([list(map(float, self.features))], dtype=float)
        if self.value is not None:
            return np.array([[float(self.value)]], dtype=float)
        raise ValueError("Request must include either 'value' or 'features'.")




@app.post("/predict/keystroke")
def predict_keystroke(payload: EventItem):
    try:
        ev = payload.event_times or []

      

        normalized_ev = []

        def safe_key(k):
            """Always return a string key — avoid None.lower error"""
            try:
                if k is None:
                    return "key"
                return str(k)
            except:
                return "key"

        if len(ev) == 0:
            normalized_ev = []
        else:
            first = ev[0]

           
            if isinstance(first, (int, float, str)):
                for t in ev:
                    try:
                        tt = float(t)
                        normalized_ev.append( ("key", tt, tt) )
                    except:
                        continue

            
            elif isinstance(first, (list, tuple)):
                for item in ev:
                    try:
                        
                        if len(item) >= 3:
                            k = safe_key(item[0])
                            normalized_ev.append( (k, float(item[1]), float(item[2])) )

                        
                        elif len(item) == 2:
                            normalized_ev.append( ("key", float(item[0]), float(item[1])) )

                       
                        elif len(item) == 1:
                            v = float(item[0])
                            normalized_ev.append( ("key", v, v) )

                    except:
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

                    except:
                        continue

           
            else:
                for it in ev:
                    try:
                        t = float(it)
                        normalized_ev.append(("key", t, t))
                    except:
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
    global lstm

        
    if lstm is None:
        logger.warning("LSTM not loaded — returning fallback trend values")

       
        vals = []
        try:
            raw = payload.past_values[-10:]
            for v in raw:
                if v is None:
                    continue
                vals.append(float(v))
        except:
            pass

       
        while len(vals) < 10:
            vals.insert(0, 0.0)

        last = vals[-1] if vals else 0.0
        future = [last + 0.02*(i+1) for i in range(5)]

        return JSONResponse(
            {"past": vals, "future": future, "note": "fallback_no_lstm"},
            status_code=200
        )




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
