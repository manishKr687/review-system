"""
NLP service: VADER sentiment scoring + keyword-based aspect extraction.
No model training required — runs fully offline after pip install.
"""
from __future__ import annotations

import re
from typing import Literal

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()

SentimentLabel = Literal["positive", "neutral", "negative"]

# Keywords per aspect — checked against lower-cased review text.
# Keep terms specific enough that they don't fire on unrelated sentences
# (e.g. "fast shipping", "love life", "sharp price").
_ASPECT_KEYWORDS: dict[str, list[str]] = {
    "camera": [
        "camera", "photo", "picture", "image", "shot", "lens", "zoom",
        "megapixel", "portrait", "selfie", "video recording", "optical",
        "autofocus", "aperture",
    ],
    "battery": [
        "battery", "charging", "mah", "power bank", "drain",
        "battery life", "fast charge", "wireless charge", "endurance",
        "standby", "overnight charge",
    ],
    "performance": [
        "performance", "lag", "processor", "cpu", "gpu", "ram",
        "benchmark", "chip", "snapdragon", "apple silicon",
        "smooth", "responsive", "sluggish", "stutter", "fps",
    ],
    "display": [
        "display", "screen", "oled", "amoled", "lcd", "resolution",
        "brightness", "nit", "refresh rate", "color accuracy", "panel",
        "sharp display", "vivid screen", "pixel",
    ],
}

# Sentence boundary split — keep it simple, no spaCy needed.
_SENT_RE = re.compile(r'(?<=[.!?])\s+')


def _split_sentences(text: str) -> list[str]:
    stripped = text.strip()
    if not stripped:
        return []
    parts = _SENT_RE.split(stripped)
    return [p for p in parts if p.strip()]


def analyse_sentiment(text: str) -> tuple[SentimentLabel, float]:
    """Return (label, compound_score) for a review body."""
    scores = _analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        return "positive", compound
    if compound <= -0.05:
        return "negative", compound
    return "neutral", compound


def extract_aspect_sentiments(text: str) -> dict[str, float]:
    """
    Return aspect → score (1–5 scale) for aspects mentioned in the text.
    Only aspects with at least one matching sentence are included.
    """
    lower = text.lower()
    sentences = _split_sentences(text)
    if not sentences:
        return {}

    result: dict[str, float] = {}

    for aspect, keywords in _ASPECT_KEYWORDS.items():
        if not any(kw in lower for kw in keywords):
            continue
        scores: list[float] = []
        for sent in sentences:
            sent_lower = sent.lower()
            if any(kw in sent_lower for kw in keywords):
                compound = _analyzer.polarity_scores(sent)["compound"]
                scores.append(compound)
        if scores:
            avg = sum(scores) / len(scores)
            # Map VADER compound [-1, 1] → aspect rating [1, 5]
            result[aspect] = round(2.0 + avg * 2.0, 2)

    return result


def score_to_aspect_rating(compound: float) -> float:
    """Convert VADER compound [-1, 1] to a 1–5 star scale."""
    return round(max(1.0, min(5.0, 2.0 + compound * 2.0)), 2)


def detect_suspicious(text: str, rating: float) -> bool:
    """
    Heuristic fake-review detector. Returns True if any signal fires:
    - Extremely short body (< 8 words)
    - All-caps text (> 60 % of alphabetic chars are uppercase)
    - Hyperbolic VADER compound (|compound| > 0.95) on a short review (< 20 words)
    - Star/sentiment mismatch: ≥ 4.5 stars + clearly negative text, or vice-versa
    """
    words = text.split()
    word_count = len(words)

    if word_count < 8:
        return True

    alpha_chars = [c for c in text if c.isalpha()]
    if alpha_chars and sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars) > 0.6:
        return True

    compound = _analyzer.polarity_scores(text)["compound"]

    if word_count < 20 and abs(compound) > 0.95:
        return True

    if rating >= 4.5 and compound < -0.4:
        return True
    if rating <= 2.0 and compound > 0.4:
        return True

    return False
