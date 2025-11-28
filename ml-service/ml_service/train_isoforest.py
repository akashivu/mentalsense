

from pathlib import Path
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

def main():
    
    rng = np.random.RandomState(42)
    normal = rng.normal(loc=0.5, scale=0.1, size=(500, 1))
    normal = np.clip(normal, 0.0, 1.0)

    
    anomalies = rng.uniform(low=0.0, high=1.0, size=(20, 1))

    X_train = np.vstack([normal, anomalies])

  
    iso = IsolationForest(
        n_estimators=200,
        contamination=0.05, 
        random_state=42
    )
    iso.fit(X_train)

   
    here = Path(__file__).resolve().parent
    model_dir = here / "ml_service" / "models"
    model_dir.mkdir(parents=True, exist_ok=True)

    out_path = model_dir / "isoforest.pkl"
    joblib.dump(iso, out_path)

    print("IsolationForest saved to:", out_path)
    print("   n_features_in_:", getattr(iso, "n_features_in_", None))
    print("   example predict(0.4):", iso.predict([[0.4]])[0])
    print("   example predict(0.9):", iso.predict([[0.9]])[0])

if __name__ == "__main__":
    main()
