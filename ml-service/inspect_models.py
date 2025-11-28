
import joblib, os, json
import numpy as np
from pprint import pprint

MODEL_IF = "ml_service/models/isoforest.pkl"
MODEL_SC = "ml_service/models/scaler.pkl"

print("cwd:", os.getcwd())
print("MODEL_IF exists:", os.path.exists(MODEL_IF))
print("MODEL_SC exists:", os.path.exists(MODEL_SC))
print()

scaler = None
isof = None

try:
    scaler = joblib.load(MODEL_SC)
    print("Scaler type:", type(scaler))
   
    n_in = getattr(scaler, "n_features_in_", None)
    print("scaler.n_features_in_:", n_in)
    
    fn = getattr(scaler, "feature_names_in_", None)
    print("scaler.feature_names_in_:", fn)
    
    print("scaler.mean_.shape:", getattr(scaler, "mean_", None).shape)
    print("scaler.mean_ (first 20):", getattr(scaler, "mean_", None)[:20].tolist())
except Exception as e:
    print("Failed loading scaler:", repr(e))

print("\n---\n")

try:
    isof = joblib.load(MODEL_IF)
    print("IsolationForest type:", type(isof))
    n_in_iso = getattr(isof, "n_features_in_", None)
    print("isof.n_features_in_:", n_in_iso)
  
    print("isof has attribute feature_names_in_?:", hasattr(isof, "feature_names_in_"))
    if hasattr(isof, "feature_names_in_"):
        print("isof.feature_names_in_:", getattr(isof, "feature_names_in_"))
except Exception as e:
    print("Failed loading isolation forest:", repr(e))

print("\n--- example predict shape test (no transform) ---")
if isof is not None:
    try:
        X = np.zeros((1, n_in_iso if n_in_iso is not None else 3))
        print("Trying isof.predict with zeros of shape:", X.shape)
        pred = isof.predict(X)
        print("isof.predict OK, result:", pred)
    except Exception as e:
        print("isof.predict error:", repr(e))
else:
    print("Skipping isof predict (isof not loaded).")
