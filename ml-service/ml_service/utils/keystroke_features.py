# ml_service/utils/keystroke_features.py
import numpy as np
import pandas as pd

def extract_features_from_raw(event_times, key_events=None, raw_text=""):
    """
    event_times: list of tuples (key, down_ts, up_ts)
    Returns dict of features:
      typing_speed, avg_hold_ms, std_hold_ms, avg_interkey_ms,
      backspace_rate, punctuation_rate, uppercase_rate, digit_rate, char_count
    """

    if not event_times:
        return {
            "typing_speed": 0.0,
            "avg_hold_ms": 0.0,
            "std_hold_ms": 0.0,
            "avg_interkey_ms": 0.0,
            "backspace_rate": 0.0,
            "punctuation_rate": 0.0,
            "uppercase_rate": 0.0,
            "digit_rate": 0.0,
            "char_count": 0
        }

    holds = []
    down_times = []
    up_times = []
    keys = []

    for k, down, up in event_times:
        keys.append(k)
        down_times.append(down)
        up_times.append(up)
        holds.append((up - down) * 1000.0)  # seconds → ms

    holds = np.array(holds)
    down_times = np.array(down_times)
    up_times = np.array(up_times)

    # 🟦 Inter-key delay
    if len(down_times) > 1:
        inter = np.diff(down_times) * 1000.0
        avg_inter = float(np.mean(inter))
    else:
        avg_inter = 0.0

    # 🟦 Hold-time stats
    avg_hold = float(np.mean(holds)) if holds.size else 0.0
    std_hold = float(np.std(holds)) if holds.size else 0.0

    # 🟦 Typing speed
    duration_s = float(up_times[-1] - down_times[0]) if len(down_times) > 1 else 0.0
    char_count = len(keys)
    typing_speed = (char_count / duration_s) if duration_s > 0 else 0.0

    # 🟦 Backspace rate
    backspace_count = sum(1 for k in keys if k.lower() in ["backspace", "back"])
    backspace_rate = (backspace_count / char_count) * 100.0 if char_count else 0.0

    # 🟦 Text-derived features
    punctuation_count = sum(1 for ch in raw_text if ch in ".,;:?!")
    uppercase_count = sum(1 for ch in raw_text if ch.isupper())
    digit_count = sum(1 for ch in raw_text if ch.isdigit())

    punctuation_rate = (punctuation_count / char_count) * 100.0 if char_count else 0.0
    uppercase_rate = (uppercase_count / char_count) * 100.0 if char_count else 0.0
    digit_rate = (digit_count / char_count) * 100.0 if char_count else 0.0

    return {
        "typing_speed": float(typing_speed),
        "avg_hold_ms": avg_hold,
        "std_hold_ms": std_hold,
        "avg_interkey_ms": avg_inter,
        "backspace_rate": backspace_rate,
        "punctuation_rate": punctuation_rate,
        "uppercase_rate": uppercase_rate,
        "digit_rate": digit_rate,
        "char_count": int(char_count)
    }


def dataframe_from_event_list(samples):
    """
    samples: [
      { 'event_times': [...], 'raw_text': "...", 'label': 0/1 }
    ]
    """
    rows = []
    for s in samples:
        feats = extract_features_from_raw(
            s.get("event_times", []),
            None,
            s.get("raw_text", "")
        )
        feats["label"] = s.get("label", 0)
        rows.append(feats)

    return pd.DataFrame(rows)
