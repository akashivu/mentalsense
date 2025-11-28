# ml-service/ml_service/nlp/roberta_emotion.py
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

# Choose a robust emotion model. cardiffnlp/twitter-roberta-base-emotion is a solid choice.
MODEL_NAME = os.getenv("EMOTION_MODEL", "cardiffnlp/twitter-roberta-base-emotion")

# Lazy global variables
pipe = None
labels = None

def get_pipeline():
    """
    Lazily load the HuggingFace pipeline for sentiment/emotion classification.
    Returns a pipeline object that returns all scores (return_all_scores=True).
    """
    global pipe, labels
    if pipe is None:
        logger.info("Loading emotion model %s", MODEL_NAME)
        # load model + tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        # device=-1 -> CPU. If you have GPU set env EMOTION_DEVICE=0 and modify to int.
        device = -1
        pipe = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True, device=device)
        # Try to get labels from the model config if available
        try:
            labels = model.config.id2label
        except Exception:
            labels = None
    return pipe

# map predicted emotions to a stress score [0.0 - 1.0]
# you can tune this mapping later with domain knowledge / user feedback
_STRESS_MAP = {
    "anger": 1.0,
    "fear": 0.9,
    "sadness": 0.8,
    "joy": 0.0,
    "surprise": 0.3,
    "neutral": 0.2,
    # fallback for other labels
}

def compute_stress_score(scores):
    """
    scores: list of dicts [{'label': '...', 'score': 0.xx}, ...]
    returns float between 0 and 1
    """
    total = 0.0
    for item in scores:
        label = item.get("label", "").lower()
        prob = float(item.get("score", 0.0))
        stress_weight = _STRESS_MAP.get(label, 0.25)  # default medium-low
        total += prob * stress_weight
    # clamp to [0,1]
    return max(0.0, min(1.0, float(total)))

def analyze_text(text):
    """
    Analyze a single text string and return:
    {
      "label": predicted_label,
      "scores": [{"label": "...", "score": 0.xx}, ...],
      "stress_score": 0.XX
    }
    """
    if not isinstance(text, str):
        raise ValueError("text must be a string")
    p = get_pipeline()
    raw = p(text)  # returns list-of-lists per input, e.g. [[{...}, {...}]]
    # raw is like: [[{'label': 'sadness', 'score': 0.87}, {...}]]
    if not raw or not isinstance(raw, list):
        raise RuntimeError("unexpected pipeline output")
    scores = raw[0]
    # normalize labels if necessary (some models prefix labels)
    normalized = []
    for item in scores:
        lbl = item.get("label", "")
        # Some models return labels like 'LABEL_0' — try to map via model labels if available
        if isinstance(lbl, int) and labels:
            lbl = labels.get(lbl, str(lbl))
        # strip common prefixes
        lbl = str(lbl).replace("__label__", "").strip()
        normalized.append({"label": lbl, "score": float(item.get("score", 0.0))})
    # predicted label = highest score
    predicted = max(normalized, key=lambda x: x["score"])["label"] if normalized else "unknown"
    stress_score = compute_stress_score(normalized)
    return {
        "label": predicted,
        "scores": normalized,
        "stress_score": float(stress_score)
    }
