
import os
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_PATH = os.path.join(DATA_DIR, "keystroke_features.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_DIR = os.path.abspath(MODEL_DIR)
MODEL_FILE = os.path.join(MODEL_DIR, "keystroke_rf.pkl")
SCALER_FILE = os.path.join(MODEL_DIR, "scaler.pkl")


N_SYN = 2000
RANDOM_SEED = 42


def generate_synthetic_keystroke_dataset(path, n_samples=N_SYN, random_state=RANDOM_SEED):
   
    np.random.seed(random_state)
   
    n = n_samples
 
    labels = np.random.choice([0, 1], size=n, p=[0.6, 0.4])
    flight_mean = np.where(labels==0,
                           np.random.normal(120, 20, n),   
                           np.random.normal(180, 40, n))   
    flight_std = np.where(labels==0,
                          np.random.normal(30, 10, n),
                          np.random.normal(45, 15, n))
    dwell_mean = np.where(labels==0,
                          np.random.normal(80, 15, n),
                          np.random.normal(100, 20, n))
    dwell_std = np.where(labels==0,
                         np.random.normal(20, 7, n),
                         np.random.normal(30, 10, n))
    hold_mean = np.where(labels==0,
                         np.random.normal(60, 10, n),
                         np.random.normal(75, 12, n))
    hold_std = np.where(labels==0,
                        np.random.normal(12, 4, n),
                        np.random.normal(18, 6, n))
    n_key_presses = np.random.poisson(30, n) + 10
    n_backspaces = np.where(labels==0,
                            np.random.poisson(1, n),
                            np.random.poisson(4, n))
  
    df = pd.DataFrame({
        "flight_mean": flight_mean,
        "flight_std": flight_std,
        "dwell_mean": dwell_mean,
        "dwell_std": dwell_std,
        "hold_mean": hold_mean,
        "hold_std": hold_std,
        "n_key_presses": n_key_presses,
        "n_backspaces": n_backspaces,
        "label": labels
    })
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"Generated synthetic dataset at: {path} (shape={df.shape})")
    return df


def main(args):
    os.makedirs(MODEL_DIR, exist_ok=True)
   
    if os.path.exists(args.data_path):
        print("Loading dataset from:", args.data_path)
        df = pd.read_csv(args.data_path)
    else:
        print("No dataset found at", args.data_path)
        df = generate_synthetic_keystroke_dataset(args.data_path, n_samples=args.synthetic_n, random_state=args.seed)

   
    if "label" not in df.columns:
        raise ValueError("Training CSV must contain a 'label' column (0/1).")
    X = df.drop(columns=["label"])
    y = df["label"]

    
    non_numeric = X.select_dtypes(exclude=[np.number]).columns.tolist()
    if non_numeric:
        print("Converting non-numeric columns:", non_numeric)
        X = pd.get_dummies(X)

   
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=args.test_size, random_state=args.seed, stratify=y if len(np.unique(y))>1 else None)
    print("Train shape:", X_train.shape, "Val shape:", X_val.shape)

   
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    
    clf = RandomForestClassifier(n_estimators=args.n_estimators, random_state=args.seed, n_jobs=-1)
    clf.fit(X_train_scaled, y_train)

   
    y_pred = clf.predict(X_val_scaled)
    acc = accuracy_score(y_val, y_pred)
    print("Validation accuracy:", acc)
    print(classification_report(y_val, y_pred))

  
    joblib.dump(clf, args.model_file)
    joblib.dump(scaler, args.scaler_file)
    print("Saved model to:", args.model_file)
    print("Saved scaler to:", args.scaler_file)


if __name__ == "__main__":
    import sys
    from sklearn.metrics import classification_report
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", default=DATA_PATH)
    parser.add_argument("--model-file", default=MODEL_FILE)
    parser.add_argument("--scaler-file", default=SCALER_FILE)
    parser.add_argument("--n-estimators", type=int, default=200)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--synthetic-n", type=int, default=N_SYN)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    main(args)
