import joblib, traceback, os, sys

MODEL_PATH = os.path.join("models", "keystroke_rf.pkl")
print("Trying to load:", MODEL_PATH)

try:
    m = joblib.load(MODEL_PATH)
    print("Loaded OK:", type(m))
except Exception:
    traceback.print_exc()
    sys.exit(1)
