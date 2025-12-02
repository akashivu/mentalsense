import numpy as np
from pathlib import Path
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from ml_service.timeseries.build_ts_dataset import build_sequences

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT.parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train(values, seq_len=10, epochs=25, batch_size=8):
    values = np.array(values, dtype=float)
    if len(values) <= seq_len:
        raise ValueError("Need more values than seq_len")
    X, y = build_sequences(values, seq_len=seq_len)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(seq_len,1)),
        LSTM(32),
        Dense(1)
    ])
    model.compile(loss="mse", optimizer="adam")
    model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=1)
    model.save(str(MODEL_DIR / "lstm_stress.h5"))
    print("Saved LSTM model at", MODEL_DIR / "lstm_stress.h5")

if __name__ == "__main__":
  
    dummy = [0.1 + (i*0.01) for i in range(60)]
    train(dummy)
