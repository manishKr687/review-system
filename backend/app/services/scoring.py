"""
Composite product scoring.

Scores are stored in product.scores JSON as:
{
  "composite":  0.0–1.0  overall weighted score
  "sentiment":  0.0–1.0  fraction of positive reviews
  "credibility":0.0–1.0  verified pct + avg helpful normalised
  "recency":    0.0–1.0  fraction of reviews in last 180 days
  "value":      0.0–1.0  composite / log2(price+2)  normalised
}

Formula:
  composite = 0.35 × norm_rating
            + 0.25 × sentiment
            + 0.20 × credibility
            + 0.20 × recency
"""
from __future__ import annotations

import math
from datetime import date, timedelta
from typing import NamedTuple


class ReviewStats(NamedTuple):
    total: int
    positive: int
    verified: int
    total_helpful: int
    recent: int          # reviews in last 180 days


def compute_scores(
    rating: float,
    price: float,
    stats: ReviewStats,
) -> dict:
    if stats.total == 0:
        return {"composite": round(rating / 5, 4), "sentiment": 0.0,
                "credibility": 0.0, "recency": 0.0, "value": 0.0}

    norm_rating   = rating / 5.0
    sentiment     = stats.positive / stats.total
    verified_pct  = stats.verified / stats.total
    avg_helpful   = stats.total_helpful / stats.total
    # Normalise helpful to [0, 1] with soft cap at 50 avg votes
    helpful_norm  = min(avg_helpful / 50.0, 1.0)
    credibility   = 0.6 * verified_pct + 0.4 * helpful_norm
    recency       = stats.recent / stats.total

    composite = (
        0.35 * norm_rating
        + 0.25 * sentiment
        + 0.20 * credibility
        + 0.20 * recency
    )

    # Value score: composite per log-dollar (higher = more bang per buck)
    raw_value = composite / math.log2(max(price, 1) + 2)
    # Normalise against a reference ($500 product at composite=0.8)
    ref_value = 0.8 / math.log2(502)
    value = min(raw_value / ref_value, 1.0)

    return {
        "composite":   round(composite,   4),
        "sentiment":   round(sentiment,   4),
        "credibility": round(credibility, 4),
        "recency":     round(recency,     4),
        "value":       round(value,       4),
    }


def cutoff_date(days: int = 180) -> str:
    return (date.today() - timedelta(days=days)).isoformat()
