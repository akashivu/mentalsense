
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)


MODEL_NAME = os.getenv("EMOTION_MODEL", "cardiffnlp/twitter-roberta-base-emotion")


pipe = None
labels = None

def get_pipeline():
   
    global pipe, labels
    if pipe is None:
        logger.info("Loading emotion model %s", MODEL_NAME)
      
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
       
        device = -1
        pipe = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True, device=device)
      
        try:
            labels = model.config.id2label
        except Exception:
            labels = None
    return pipe


_STRESS_MAP = {
    "anger": 1.0,
    "fear": 0.9,
    "sadness": 0.8,
    "joy": 0.0,
    "surprise": 0.3,
    "neutral": 0.2,
    
}

def compute_stress_score(scores):
    
    total = 0.0
    for item in scores:
        label = item.get("label", "").lower()
        prob = float(item.get("score", 0.0))
        stress_weight = _STRESS_MAP.get(label, 0.25)  
        total += prob * stress_weight
    
    return max(0.0, min(1.0, float(total)))

def analyze_text(text):
  
    if not isinstance(text, str):
        raise ValueError("text must be a string")
    p = get_pipeline()
    raw = p(text)  
    if not raw or not isinstance(raw, list):
        raise RuntimeError("unexpected pipeline output")
    scores = raw[0]
    
    normalized = []
    for item in scores:
        lbl = item.get("label", "")
       
        if isinstance(lbl, int) and labels:
            lbl = labels.get(lbl, str(lbl))
       
        lbl = str(lbl).replace("__label__", "").strip()
        normalized.append({"label": lbl, "score": float(item.get("score", 0.0))})
   
    predicted = max(normalized, key=lambda x: x["score"])["label"] if normalized else "unknown"
    stress_score = compute_stress_score(normalized)
    return {
        "label": predicted,
        "scores": normalized,
        "stress_score": float(stress_score)
    }
