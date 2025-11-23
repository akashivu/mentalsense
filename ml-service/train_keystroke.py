# ml-service/train_keystroke.py
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "synthetic_keystrokes.csv"
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(exist_ok=True)

def train():
    df = pd.read_csv(DATA)
    X = df.drop(columns=["label"])
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # baseline: RandomForest
    clf = RandomForestClassifier(n_estimators=200, random_state=42)
    clf.fit(X_train_s, y_train)

    y_pred = clf.predict(X_test_s)
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, clf.predict_proba(X_test_s)[:,1])
    print("RF Acc:", acc, "AUC:", auc)
    print(classification_report(y_test, y_pred))

    # Save model & scaler
    joblib.dump(clf, MODEL_DIR / "keystroke_rf.pkl")
    joblib.dump(scaler, MODEL_DIR / "scaler.pkl")
    print("Saved model and scaler to", MODEL_DIR)

if __name__ == "__main__":
    train()
