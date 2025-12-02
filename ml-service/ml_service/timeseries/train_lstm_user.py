

from pathlib import Path
import logging
from typing import List, Dict, Any, Optional

import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib


from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping


from ml_service.timeseries.build_ts_dataset import build_sequences

logger = logging.getLogger("ml_service.timeseries")
logger.setLevel(logging.INFO)


ROOT = Path(__file__).resolve().parent

MODEL_DIR = ROOT.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def _make_model(seq_len: int) -> Sequential:
   
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(seq_len, 1)),
        LSTM(32),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model


def train_user_lstm(
    user_id: int,
    values: List[float],
    seq_len: int = 10,
    epochs: int = 25,
    batch_size: int = 8,
    scale: bool = True,
    min_len: int = 20,
    early_stopping: bool = True,
    verbose: int = 0
) -> Dict[str, Any]:
   
    try:
        if values is None or not isinstance(values, (list, tuple, np.ndarray)):
            return {"success": False, "message": "values must be a list/array of floats", "model_path": None, "scaler_path": None}

       
        vals = np.array(values, dtype=float)
        if vals.size < min_len:
            return {"success": False, "message": f"Need at least {min_len} values to train (got {vals.size})", "model_path": None, "scaler_path": None}

        if vals.ndim != 1:
            vals = vals.flatten()

       
        X, y = build_sequences(vals, seq_len=seq_len)
        if X.size == 0 or y.size == 0:
            return {"success": False, "message": "Not enough sequence windows generated", "model_path": None, "scaler_path": None}

        
        X = X.reshape((X.shape[0], X.shape[1], 1))

        scaler = None
        scaler_path = None

        if scale:
           
            try:
                flatX = X.reshape((X.shape[0], X.shape[1])) 
                scaler = StandardScaler()
                flatX_scaled = scaler.fit_transform(flatX)
               
                X = flatX_scaled.reshape((flatX_scaled.shape[0], flatX_scaled.shape[1], 1))
                scaler_path = str(MODEL_DIR / f"user_{user_id}_scaler.pkl")
                joblib.dump(scaler, scaler_path)
                logger.info("Saved scaler for user %s at %s", user_id, scaler_path)
            except Exception as ex:
                logger.exception("Failed to fit scaler; continuing without scaler: %s", ex)
                scaler = None
                scaler_path = None

       
        model = _make_model(seq_len=seq_len)

        callbacks = []
        if early_stopping:
            callbacks.append(EarlyStopping(monitor="loss", patience=5, restore_best_weights=True))

        model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=verbose, callbacks=callbacks)

        model_path = MODEL_DIR / f"user_{user_id}_lstm.h5"
        model.save(str(model_path), include_optimizer=False)
        logger.info("Saved LSTM model for user %s at %s", user_id, model_path)

        return {"success": True, "message": "trained", "model_path": model_path, "scaler_path": scaler_path}
    except Exception as e:
        logger.exception("train_user_lstm failed for user %s: %s", user_id, e)
        return {"success": False, "message": f"exception: {e}", "model_path": None, "scaler_path": None}


def predict_future_from_model(
    user_id: int,
    past_values: List[float],
    n_steps: int = 5,
    seq_len: int = 10
) -> Dict[str, Any]:
    
    try:
        model_path = MODEL_DIR / f"user_{user_id}_lstm.h5"
        scaler_path = MODEL_DIR / f"user_{user_id}_scaler.pkl"

        if not model_path.exists():
            return {"success": False, "message": "model not found", "past": [], "future": []}

        
        vals = []
        try:
            for v in past_values[-seq_len:]:
                vals.append(float(v))
        except Exception:
           
            vals = []
            for v in past_values:
                try:
                    vals.append(float(v))
                except:
                    continue

      
        while len(vals) < seq_len:
            vals.insert(0, 0.0)

       
        seq = np.array(vals, dtype=float)

       
        if scaler_path.exists():
            try:
                scaler: Optional[StandardScaler] = joblib.load(scaler_path)
               
                scaled = scaler.transform(seq.reshape(1, -1)).reshape(-1)
                seq = scaled
            except Exception as ex:
                logger.exception("Failed to load/apply scaler %s: %s", scaler_path, ex)

       
        prev = seq.reshape(1, seq_len, 1)

        model = load_model(str(model_path), compile=False)

        future = []
        for _ in range(n_steps):
            pred = float(model.predict(prev, verbose=0)[0, 0])
            future.append(pred)

        
            next_seq = np.append(prev[0, 1:, 0], pred)
            
            prev = next_seq.reshape(1, seq_len, 1)

        return {"success": True, "message": "predicted", "past": vals, "future": future}
    except Exception as e:
        logger.exception("predict_future_from_model failed for user %s: %s", user_id, e)
        return {"success": False, "message": str(e), "past": [], "future": []}



if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Train per-user LSTM or test prediction")
    parser.add_argument("--train", action="store_true", help="Train a model for given user and values JSON file")
    parser.add_argument("--predict", action="store_true", help="Predict future values with saved model")
    parser.add_argument("--user", type=int, required=True, help="user id")
    parser.add_argument("--values", type=str, help="path to JSON file with an array of numeric values or a JSON string")
    parser.add_argument("--n", type=int, default=5, help="n future steps to predict")
    parser.add_argument("--seq_len", type=int, default=10)
    parser.add_argument("--epochs", type=int, default=25)
    args = parser.parse_args()

    if args.train:
        if not args.values:
            print("Provide --values (path or json string)")
            raise SystemExit(1)

      
        try:
            p = Path(args.values)
            if p.exists():
                vals = json.loads(p.read_text())
            else:
                vals = json.loads(args.values)
        except Exception as e:
            print("Failed to load values:", e)
            raise SystemExit(1)

        res = train_user_lstm(args.user, vals, seq_len=args.seq_len, epochs=args.epochs, verbose=1)
        print(json.dumps(res, indent=2))

    elif args.predict:
        if not args.values:
            print("Provide --values (path or json string) with past values")
            raise SystemExit(1)

        try:
            p = Path(args.values)
            if p.exists():
                vals = json.loads(p.read_text())
            else:
                vals = json.loads(args.values)
        except Exception as e:
            print("Failed to load values:", e)
            raise SystemExit(1)

        out = predict_future_from_model(args.user, vals, n_steps=args.n, seq_len=args.seq_len)
        print(json.dumps(out, indent=2))
    else:
        print("Provide --train or --predict. Example:")
        print("  python train_lstm_user.py --train --user 12 --values '[0.1,0.2,0.15,...]'")
