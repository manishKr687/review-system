"""
Celery tasks for NLP analysis of reviews and product aspect aggregation.
"""
from __future__ import annotations

import logging
from collections import defaultdict

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SyncSessionLocal
from app.models.product import Product
from app.models.review import Review
from app.services.nlp import analyse_sentiment, detect_suspicious, extract_aspect_sentiments

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="analysis.analyse_review")
def analyse_review(self, review_id: int) -> dict:
    """Analyse a single review: update sentiment in the DB."""
    with SyncSessionLocal() as db:
        review: Review | None = db.get(Review, review_id)
        if not review:
            return {"error": f"Review {review_id} not found"}

        label, score = analyse_sentiment(review.body)
        review.sentiment = label
        review.is_suspicious = detect_suspicious(review.body, review.rating)
        db.commit()
        logger.info("Review %d → %s (%.3f)", review_id, label, score)
        return {"review_id": review_id, "sentiment": label, "score": score}


@celery_app.task(bind=True, name="analysis.analyse_all_reviews")
def analyse_all_reviews(self) -> dict:
    """
    Batch-analyse every review in the DB, then recompute per-product
    aspect ratings from the aggregated sentence-level scores.
    """
    with SyncSessionLocal() as db:
        reviews = db.execute(select(Review)).scalars().all()
        total = len(reviews)
        logger.info("Starting NLP analysis for %d reviews", total)
        self.update_state(state="PROGRESS", meta={"done": 0, "total": total})

        # Map product_id → aspect → [scores]
        aspect_accum: dict[int, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))

        for i, review in enumerate(reviews):
            label, _ = analyse_sentiment(review.body)
            review.sentiment = label
            review.is_suspicious = detect_suspicious(review.body, review.rating)

            aspects = extract_aspect_sentiments(review.body)
            for aspect, score in aspects.items():
                aspect_accum[review.product_id][aspect].append(score)

            if i % 200 == 0:
                db.flush()
                self.update_state(state="PROGRESS", meta={"done": i, "total": total})

        db.flush()

        # Recompute per-product aspect averages
        products = db.execute(select(Product)).scalars().all()
        updated = 0
        for product in products:
            pid = product.id
            if pid not in aspect_accum:
                continue
            new_aspects = dict(product.aspects or {})
            for aspect, scores in aspect_accum[pid].items():
                new_aspects[aspect] = round(sum(scores) / len(scores), 2)
            product.aspects = new_aspects
            updated += 1

        db.commit()
        logger.info("NLP analysis complete: %d reviews, %d products updated", total, updated)
        return {"reviews_processed": total, "products_updated": updated}
