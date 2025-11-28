
import random
import numpy as np
import pandas as pd
from pathlib import Path
from ml_service.utils.keystroke_features import dataframe_from_event_list

OUT = Path(__file__).resolve().parents[1] / "synthetic_keystrokes.csv"

def make_sample(label):
    """
    Generate a synthetic keystroke sample.
    label = 0 (low stress), 1 (high stress)
    """
    n = random.randint(20, 120)  
    t = 0.0
    samples = []
    raw_chars = []

    for _ in range(n):
        
        if random.random() < 0.02:
            k = "Backspace"
            raw_chars.append("")
        else:
            ch = random.choice("abcdefghijklmnopqrstuvwxyz     .,")
            k = ch
            raw_chars.append(ch)

        
        if label == 1:
            hold = max(0.02, random.gauss(0.09, 0.07))
            inter = max(0.01, random.gauss(0.10, 0.12))
        else:
            hold = max(0.03, random.gauss(0.12, 0.03))
            inter = max(0.05, random.gauss(0.12, 0.05))

        down = t
        up = t + hold
        samples.append((k, down, up))

        t = up + inter

    raw_text = "".join(c for c in raw_chars if c)

    return {
        "event_times": samples,
        "raw_text": raw_text,
        "label": label
    }


def generate_dataset(n_low=800, n_high=400):
    rows = []

   
    for _ in range(n_low):
        rows.append(make_sample(0))

    
    for _ in range(n_high):
        rows.append(make_sample(1))

    df = dataframe_from_event_list(rows)
    df.to_csv(OUT, index=False)
    print("Saved synthetic dataset →", OUT)


if __name__ == "__main__":
    generate_dataset()
