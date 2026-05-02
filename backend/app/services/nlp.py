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
