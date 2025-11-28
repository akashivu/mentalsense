import numpy as np
from pathlib import Path
from sklearn.ensemble import IsolationForest
import joblib

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train(values, contamination=0.07):
    values = np.array(values).reshape(-1, 1)
    model = IsolationForest(contamination=contamination, random_state=42)
    model.fit(values)
    joblib.dump(model, MODEL_DIR / "isoforest.pkl")
    print("Saved Isolation Forest at", MODEL_DIR / "isoforest.pkl")

if __name__ == "__main__":
    dummy = [0.1 + (i*0.01) for i in range(60)]
    train(dummy)
