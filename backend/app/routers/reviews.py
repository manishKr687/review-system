from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewOut, ReviewsResponse
from app.services.cache import cache_get, cache_set

router = APIRouter()


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
