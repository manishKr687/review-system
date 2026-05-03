from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import attributes

from app.config import settings
from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut, ReviewsResponse
from app.services.cache import cache_delete_prefix, cache_get, cache_set, get_redis
from app.services.nlp import analyse_sentiment, detect_suspicious, extract_aspect_sentiments

router = APIRouter()

_REVIEW_RATE_LIMIT = 5
_REVIEW_RATE_WINDOW = 3600  # 1 hour in seconds


async def _enforce_rate_limit(ip: str) -> None:
    key = f"ratelimit:reviews:{ip}"
    r = get_redis()
    count = await r.incr(key)
    if count == 1:
        await r.expire(key, _REVIEW_RATE_WINDOW)
    if count > _REVIEW_RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {_REVIEW_RATE_LIMIT} reviews per hour.",
        )


async def _recompute_aspects(product: Product, db: AsyncSession) -> None:
    """Update product aspect scores as a running average of all approved reviews."""
    reviews = (await db.execute(
        select(Review).where(Review.product_id == product.id, Review.status == "approved")
    )).scalars().all()

    if not reviews:
        return

    totals: dict[str, list[float]] = {}
    for r in reviews:
        for aspect, score in extract_aspect_sentiments(r.body).items():
            totals.setdefault(aspect, []).append(score)

    if not totals:
        return

    new_aspects = dict(product.aspects)
    for aspect, scores in totals.items():
        if aspect in new_aspects:
            new_aspects[aspect] = round(sum(scores) / len(scores), 2)
    product.aspects = new_aspects
    attributes.flag_modified(product, "aspects")


@router.get("/{product_id}", response_model=ReviewsResponse)
async def get_reviews(
    product_id: int,
    sentiment: Literal["all", "positive", "negative", "neutral"] = "all",
    verified_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"reviews:{product_id}:{sentiment}:{verified_only}"
    if cached := await cache_get(cache_key):
        return cached

    q = select(Review).where(Review.product_id == product_id, Review.status == "approved")
    if sentiment != "all":
        q = q.where(Review.sentiment == sentiment)
    if verified_only:
        q = q.where(Review.verified == True)  # noqa: E712

    q = q.order_by(Review.helpful.desc(), Review.rating.desc())
    rows = (await db.execute(q)).scalars().all()

    result = ReviewsResponse(total=len(rows), reviews=[ReviewOut.model_validate(r) for r in rows])
    await cache_set(cache_key, result.model_dump())
    return result


@router.post("/{product_id}", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    request: Request,
    product_id: int,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    client_ip = request.client.host if request.client else None

    if client_ip:
        await _enforce_rate_limit(client_ip)

    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # One review per IP per product
    if client_ip:
        existing = (await db.execute(
            select(Review).where(Review.product_id == product_id, Review.reviewer_ip == client_ip)
        )).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="You have already reviewed this product.")

    label, _ = analyse_sentiment(payload.body)
    suspicious = detect_suspicious(payload.body, payload.rating)
    # Suspicious reviews go to moderation queue; clean ones auto-approve
    review_status = "pending" if suspicious else "approved"

    review = Review(
        product_id=product_id,
        author=payload.author,
        rating=payload.rating,
        title=payload.title,
        body=payload.body,
        sentiment=label,
        verified=False,
        helpful=0,
        date=date.today().isoformat(),
        is_suspicious=suspicious,
        reviewer_ip=client_ip,
        status=review_status,
    )
    db.add(review)

    # Update product rolling rating (approved reviews only)
    approved_reviews = (await db.execute(
        select(Review).where(Review.product_id == product_id, Review.status == "approved")
    )).scalars().all()

    if review_status == "approved":
        total = len(approved_reviews) + 1
        avg = (sum(r.rating for r in approved_reviews) + payload.rating) / total
        product.review_count = total
        product.rating = round(avg, 1)

    await db.commit()
    await db.refresh(review)
    await db.refresh(product)  # re-hydrate after commit expiry

    # Recompute aspect scores from all approved reviews
    if review_status == "approved":
        await _recompute_aspects(product, db)
        await db.commit()

    await cache_delete_prefix(f"reviews:{product_id}:")
    await cache_delete_prefix(f"product:{product_id}")

    return ReviewOut.model_validate(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    request: Request,
    x_admin_key: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    is_admin = x_admin_key == settings.admin_api_key
    client_ip = request.client.host if request.client else None
    is_owner = client_ip and review.reviewer_ip == client_ip

    if not is_admin and not is_owner:
        raise HTTPException(status_code=403, detail="Not authorised to delete this review.")

    product = await db.get(Product, review.product_id)
    product_id = review.product_id
    await db.delete(review)
    await db.commit()

    # Recompute rating and aspects after deletion
    if product:
        remaining = (await db.execute(
            select(Review).where(Review.product_id == product_id, Review.status == "approved")
        )).scalars().all()
        product.review_count = len(remaining)
        product.rating = round(sum(r.rating for r in remaining) / len(remaining), 1) if remaining else 0.0
        await db.refresh(product)
        await _recompute_aspects(product, db)
        await db.commit()

    await cache_delete_prefix(f"reviews:{product_id}:")
    await cache_delete_prefix(f"product:{product_id}")
