from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut, ReviewsResponse
from app.services.cache import cache_delete_prefix, cache_get, cache_set, get_redis
from app.services.nlp import analyse_sentiment, detect_suspicious

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

    q = select(Review).where(Review.product_id == product_id)
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

    # Rate limit: 5 reviews per hour per IP across all products
    if client_ip:
        await _enforce_rate_limit(client_ip)

    # Verify product exists
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # One review per IP per product
    client_ip = request.client.host if request.client else None
    if client_ip:
        existing = (await db.execute(
            select(Review).where(Review.product_id == product_id, Review.reviewer_ip == client_ip)
        )).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="You have already reviewed this product.")

    # Run NLP inline — fast enough for a single review
    label, _ = analyse_sentiment(payload.body)
    suspicious = detect_suspicious(payload.body, payload.rating)

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
    )
    db.add(review)

    # Update product review count and rating average
    all_reviews = (await db.execute(
        select(Review).where(Review.product_id == product_id)
    )).scalars().all()
    total = len(all_reviews) + 1
    avg = (sum(r.rating for r in all_reviews) + payload.rating) / total
    product.review_count = total
    product.rating = round(avg, 1)

    await db.commit()
    await db.refresh(review)

    # Bust cached review lists for this product
    await cache_delete_prefix(f"reviews:{product_id}:")

    return ReviewOut.model_validate(review)
