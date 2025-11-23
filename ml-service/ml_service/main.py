from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import joblib
import numpy as np
from ml_service.utils.keystroke_features import extract_features_from_raw

app = FastAPI(title="MentalSense ML Service")

HERE = Path(__file__).resolve().parent
MODEL_DIR_CANDIDATES = [
    HERE / "models",
    HERE.parent / "models",
    HERE.parent.parent / "models"
]

MODEL_DIR = next((p for p in MODEL_DIR_CANDIDATES if p.exists()), MODEL_DIR_CANDIDATES[1])

MODEL_PATH = MODEL_DIR / "keystroke_rf.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"

if not MODEL_PATH.exists() or not SCALER_PATH.exists():
    raise RuntimeError(f"Model or scaler not found. Looked at: {MODEL_DIR}. "
                       f"Ensure keystroke_rf.pkl and scaler.pkl exist there.")

clf = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

class EventItem(BaseModel):
    event_times: list  # list of [key, down_ts, up_ts] in seconds
    raw_text: str = ""

@app.post("/predict/keystroke")
def predict_keystroke(payload: EventItem):
    try:
        ev = payload.event_times
        feats = extract_features_from_raw(ev, None, payload.raw_text)
        feature_order = ["typing_speed","avg_hold_ms","std_hold_ms","avg_interkey_ms",
                         "backspace_rate","punctuation_rate","uppercase_rate","digit_rate","char_count"]
        X = np.array([[feats[k] for k in feature_order]])
        Xs = scaler.transform(X)
        prob = float(clf.predict_proba(Xs)[0,1])
        label = int(prob > 0.5)
        stress_score = prob
        return {"label": label, "stress_score": stress_score, "confidence": prob}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
