
from ml_service.nlp.roberta_emotion import analyze_text
import math

DEFAULT_WEIGHTS = {
    "anger": 1.0,
    "fear": 0.95,
    "sadness": 0.85,
    "disgust": 0.9,
    "joy": 0.0,
    "surprise": 0.25,
    "neutral": 0.15
}

def normalize(x, a=0.0, b=1.0):
    return max(a, min(b, x))

def compute_text_metrics(text, weights=None):
    if weights is None:
        weights = DEFAULT_WEIGHTS

    res = analyze_text(text)  
    scores_list = res.get("scores", [])
    normalized = { item["label"].lower(): float(item["score"]) for item in scores_list }

    stress = 0.0
    neg_sum = 0.0
    for lbl, prob in normalized.items():
        w = weights.get(lbl, 0.25)
        stress += prob * w
        if lbl in ("fear","sadness","anger","disgust"):
            neg_sum += prob

    text_stress = normalize(stress, 0.0, 1.0)
    valence = normalized.get("joy", 0.0) - neg_sum
    valence = normalize((valence + 1.0) / 2.0, 0.0, 1.0)

    return {
        "label": res.get("label"),
        "scores": normalized,
        "text_stress_score": float(text_stress),
        "negativity_score": float(neg_sum),
        "valence": float(valence)
    }
