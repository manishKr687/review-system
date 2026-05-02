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

# Keywords per aspect — checked against lower-cased review text
_ASPECT_KEYWORDS: dict[str, list[str]] = {
    "camera": [
        "camera", "photo", "picture", "image", "shot", "lens", "zoom",
        "megapixel", "mp", "portrait", "selfie", "video recording",
    ],
    "battery": [
        "battery", "charge", "charging", "mah", "power", "drain",
        "life", "fast charge", "wireless charge", "endurance",
    ],
    "performance": [
        "performance", "speed", "fast", "slow", "lag", "processor",
        "cpu", "gpu", "ram", "memory", "benchmark", "chip", "snapdragon",
        "apple silicon", "smooth", "responsive",
    ],
    "display": [
        "display", "screen", "oled", "amoled", "lcd", "resolution",
        "brightness", "nit", "refresh rate", "hz", "color", "panel",
        "sharp", "vivid",
    ],
}

# Sentence boundary split — keep it simple, no spaCy needed
_SENT_RE = re.compile(r'(?<=[.!?])\s+')


def _split_sentences(text: str) -> list[str]:
    return _SENT_RE.split(text.strip()) or [text]


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
    Return a dict of aspect → average VADER compound score (0–5 scaled).
    Only aspects mentioned in the text are included.
    """
    lower = text.lower()
    sentences = _split_sentences(text)
    result: dict[str, list[float]] = {}

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
            # Map from [-1, 1] to [1, 5]
            result[aspect] = round(2.0 + avg * 2.0, 2)

    return result


def score_to_aspect_rating(compound: float) -> float:
    """Convert VADER compound [-1, 1] to a 1-5 star scale."""
    return round(max(1.0, min(5.0, 2.0 + compound * 2.0)), 2)


def detect_suspicious(text: str, rating: float) -> bool:
    """
    Heuristic fake-review detector. Flags reviews that show common spam signals:
    - Extremely short body (< 8 words)
    - All-caps text (shouting / bot pattern)
    - Hyperbolic VADER compound (> 0.95 or < -0.95) on a very short review
    - Star/sentiment mismatch: 5-star rating with clearly negative text, or vice-versa
    """
    words = text.split()
    word_count = len(words)

    if word_count < 8:
        return True

    # All-caps threshold: >60 % of alphabetic chars are uppercase
    alpha = [c for c in text if c.isalpha()]
    if alpha and sum(1 for c in alpha if c.isupper()) / len(alpha) > 0.6:
        return True

    compound = _analyzer.polarity_scores(text)["compound"]

    # Hyperbolic extremely short review
    if word_count < 20 and abs(compound) > 0.95:
        return True

    # Star / sentiment mismatch
    if rating >= 4.5 and compound < -0.4:
        return True
    if rating <= 2.0 and compound > 0.4:
        return True

    return False
