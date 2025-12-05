import os
import argparse
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# ============================================================
#              CONFIG PATHS
# ============================================================

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_PATH = os.path.join(DATA_DIR, "keystroke_features.csv")

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_FILE = os.path.join(MODEL_DIR, "keystroke_rf.pkl")
SCALER_FILE = os.path.join(MODEL_DIR, "scaler.pkl")

N_SYN = 2000
RANDOM_SEED = 42


# ============================================================
#      SYNTHETIC DATA GENERATION FOR 9 FEATURES
# ============================================================

def generate_synthetic_keystroke_dataset(path, n_samples=N_SYN, random_state=RANDOM_SEED):
    np.random.seed(random_state)
    n = n_samples

    # Labels: 0=low stress, 1=high stress
    labels = np.random.choice([0, 1], size=n, p=[0.6, 0.4])

    typing_speed = np.where(labels == 0,
                            np.random.normal(2.5, 0.5, n),
                            np.random.normal(4.0, 0.8, n))

    avg_hold_ms = np.where(labels == 0,
                           np.random.normal(80, 10, n),
                           np.random.normal(120, 20, n))

    std_hold_ms = np.where(labels == 0,
                           np.random.normal(20, 5, n),
                           np.random.normal(40, 10, n))

    avg_interkey_ms = np.where(labels == 0,
                               np.random.normal(150, 30, n),
                               np.random.normal(250, 50, n))

    backspace_rate = np.where(labels == 0,
                              np.random.normal(1, 1, n),
                              np.random.normal(5, 2, n))

    punctuation_rate = np.where(labels == 0,
                                np.random.normal(1, 1, n),
                                np.random.normal(4, 2, n))

    uppercase_rate = np.where(labels == 0,
                              np.random.normal(1, 0.8, n),
                              np.random.normal(3, 1.5, n))

    digit_rate = np.where(labels == 0,
                          np.random.normal(1, 1, n),
                          np.random.normal(5, 2, n))

    char_count = np.where(labels == 0,
                          np.random.normal(20, 5, n),
                          np.random.normal(40, 10, n))

    df = pd.DataFrame({
        "typing_speed": typing_speed,
        "avg_hold_ms": avg_hold_ms,
        "std_hold_ms": std_hold_ms,
        "avg_interkey_ms": avg_interkey_ms,
        "backspace_rate": backspace_rate,
        "punctuation_rate": punctuation_rate,
        "uppercase_rate": uppercase_rate,
        "digit_rate": digit_rate,
        "char_count": char_count,
        "label": labels
    })

    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"Generated synthetic dataset at: {path} (shape={df.shape})")

    return df


# ============================================================
#                     TRAIN PIPELINE
# ============================================================

def main(args):
    os.makedirs(MODEL_DIR, exist_ok=True)

    # Load dataset or generate synthetic
    if os.path.exists(args.data_path):
        print("Loading dataset from:", args.data_path)
        df = pd.read_csv(args.data_path)
    else:
        print("No dataset found, generating synthetic data...")
        df = generate_synthetic_keystroke_dataset(args.data_path,
                                                  n_samples=args.synthetic_n,
                                                  random_state=args.seed)

    # Ensure "label" exists
    if "label" not in df.columns:
        raise ValueError("Training CSV must contain a 'label' column (0/1).")

    feature_order = [
        "typing_speed",
        "avg_hold_ms",
        "std_hold_ms",
        "avg_interkey_ms",
        "backspace_rate",
        "punctuation_rate",
        "uppercase_rate",
        "digit_rate",
        "char_count"
    ]

    X = df[feature_order]
    y = df["label"]

    # Train/validation split
    stratify = y if len(np.unique(y)) > 1 else None

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=args.test_size, random_state=args.seed, stratify=stratify
    )

    print("Train shape:", X_train.shape, "Val shape:", X_val.shape)

    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    # Train model
    clf = RandomForestClassifier(
        n_estimators=args.n_estimators,
        random_state=args.seed,
        n_jobs=-1
    )
    clf.fit(X_train_scaled, y_train)

    # Validate
    y_pred = clf.predict(X_val_scaled)
    acc = accuracy_score(y_val, y_pred)

    print("\nValidation accuracy:", acc)
    print(classification_report(y_val, y_pred))

    # Save model + scaler
    joblib.dump(clf, args.model_file)
    joblib.dump(scaler, args.scaler_file)

    print("\nSaved model to:", args.model_file)
    print("Saved scaler to:", args.scaler_file)


# ============================================================
#                     CLI ENTRY POINT
# ============================================================

if __name__ == "__main__":
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
