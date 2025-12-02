

from pathlib import Path
import logging
from typing import Any, Dict, List, Optional, Union

import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("ml_service.timeseries.anomaly")
logger.setLevel(logging.INFO)


ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def _ensure_array(values: Union[List, np.ndarray]) -> np.ndarray:
  
    arr = np.array(values, dtype=float)
    if arr.ndim == 1:
        return arr.reshape(-1, 1)
    return arr


def train_user_isoforest(
    user_id: int,
    values_or_features: Union[List[float], List[List[float]], np.ndarray],
    contamination: float = 0.07,
    save_scaler: bool = True,
    random_state: int = 42,
    verbose: int = 0
) -> Dict[str, Any]:
   
    try:
        if values_or_features is None:
            return {"success": False, "message": "no input provided", "model_path": None, "scaler_path": None}

        X = _ensure_array(values_or_features)
        n_samples, n_features = X.shape
        if n_samples < 5:
            return {"success": False, "message": f"too few samples to train (need >=5, got {n_samples})", "model_path": None, "scaler_path": None}

        scaler_path = None
        scaler = None
        X_for_model = X

        
        if save_scaler:
            try:
                scaler = StandardScaler()
                X_scaled = scaler.fit_transform(X)
                X_for_model = X_scaled
                scaler_path = str(MODEL_DIR / f"user_{user_id}_scaler.pkl")
                joblib.dump(scaler, scaler_path)
                if verbose:
                    logger.info("Saved scaler for user %s at %s", user_id, scaler_path)
            except Exception as ex:
                logger.exception("Failed to fit/save scaler for user %s: %s", user_id, ex)
                scaler = None
                scaler_path = None
                X_for_model = X  

       
        model = IsolationForest(contamination=float(contamination), random_state=int(random_state))
        model.fit(X_for_model)

        model_path = str(MODEL_DIR / f"user_{user_id}_isoforest.pkl")
        joblib.dump(model, model_path)
        if verbose:
            logger.info("Saved IsolationForest for user %s at %s (n_samples=%s, n_features=%s)", user_id, model_path, n_samples, n_features)

        return {"success": True, "message": "trained", "model_path": model_path, "scaler_path": scaler_path}
    except Exception as e:
        logger.exception("train_user_isoforest failed for user %s: %s", user_id, e)
        return {"success": False, "message": str(e), "model_path": None, "scaler_path": None}


def predict_user_anomaly(
    user_id: int,
    values_or_features: Union[List[float], List[List[float]], np.ndarray],
    use_scaler_if_exists: bool = True
) -> Dict[str, Any]:
   
    try:
        model_path = MODEL_DIR / f"user_{user_id}_isoforest.pkl"
        if not model_path.exists():
            return {"success": False, "message": "model not found", "prediction": []}

        model = joblib.load(model_path)

        X = np.array(values_or_features, dtype=float)
       
        if X.ndim == 1:
            X = X.reshape(1, -1)

       
        scaler_path = MODEL_DIR / f"user_{user_id}_scaler.pkl"
        if use_scaler_if_exists and scaler_path.exists():
            try:
                scaler: StandardScaler = joblib.load(scaler_path)
                X = scaler.transform(X)
            except Exception:
                logger.exception("Failed to load/apply scaler at %s; continuing without scaler", scaler_path)

        preds = model.predict(X)
      
        preds_list = [int(p) for p in preds.tolist()]

        return {"success": True, "message": "predicted", "prediction": preds_list}
    except Exception as e:
        logger.exception("predict_user_anomaly failed for user %s: %s", user_id, e)
        return {"success": False, "message": str(e), "prediction": []}



if __name__ == "__main__":
    import argparse
    import json
    parser = argparse.ArgumentParser(description="Train or predict per-user IsolationForest")
    parser.add_argument("--train", action="store_true", help="Train for a user")
    parser.add_argument("--predict", action="store_true", help="Predict anomaly for a user")
    parser.add_argument("--user", type=int, required=True, help="User id")
    parser.add_argument("--values", type=str, help="JSON array of values or array of arrays")
    parser.add_argument("--contamination", type=float, default=0.07)
    parser.add_argument("--save_scaler", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if args.train:
        if not args.values:
            print("Provide --values '[0.1,0.2,...]' or '[[0.1],[0.2],...]'")
            raise SystemExit(1)
        try:
            vals = json.loads(args.values)
        except Exception as e:
            print("Failed to parse values:", e)
            raise SystemExit(1)
        r = train_user_isoforest(args.user, vals, contamination=args.contamination, save_scaler=args.save_scaler, verbose=int(args.verbose))
        print(json.dumps(r, indent=2))

    elif args.predict:
        if not args.values:
            print("Provide --values")
            raise SystemExit(1)
        try:
            vals = json.loads(args.values)
        except Exception as e:
            print("Failed to parse values:", e)
            raise SystemExit(1)
        r = predict_user_anomaly(args.user, vals)
        print(json.dumps(r, indent=2))
    else:
        print("Use --train or --predict. Example:")
        print("  python train_anomaly_user.py --train --user 12 --values '[0.1,0.11,0.12,...]'")
        print("  python train_anomaly_user.py --predict --user 12 --values '[0.85]'")
