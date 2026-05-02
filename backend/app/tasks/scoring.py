"""
Celery task: compute composite + sub-scores for every product.
Uses synchronous SQLAlchemy (psycopg2) — same pattern as analysis.py.
"""
from __future__ import annotations

import logging
from collections import defaultdict

from sqlalchemy import select

from app.celery_app import celery_app
from app.database import SyncSessionLocal
from app.models.product import Product
from app.models.review import Review
from app.services.scoring import ReviewStats, compute_scores, cutoff_date

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="scoring.compute_all_scores")
def compute_all_scores(self) -> dict:
    """
    For every product, aggregate review stats then write computed scores
    back to product.scores JSON.
    """
    with SyncSessionLocal() as db:
        products = db.execute(select(Product)).scalars().all()
        reviews  = db.execute(select(Review)).scalars().all()
        total_products = len(products)

        cutoff = cutoff_date(180)

        # Aggregate per product
        stats: dict[int, dict] = defaultdict(lambda: {
            "total": 0, "positive": 0, "verified": 0,
            "helpful": 0, "recent": 0,
        })
        for r in reviews:
            s = stats[r.product_id]
            s["total"]    += 1
            s["positive"] += 1 if r.sentiment == "positive" else 0
            s["verified"] += 1 if r.verified else 0
            s["helpful"]  += r.helpful or 0
            s["recent"]   += 1 if (r.date or "") >= cutoff else 0

        updated = 0
        for product in products:
            s = stats[product.id]
            rs = ReviewStats(
                total         = s["total"],
                positive      = s["positive"],
                verified      = s["verified"],
                total_helpful = s["helpful"],
                recent        = s["recent"],
            )
            product.scores = compute_scores(product.rating, product.price, rs)
            updated += 1

        db.commit()
        logger.info("Scoring complete: %d products updated", updated)
        return {"products_scored": updated, "total_products": total_products}
