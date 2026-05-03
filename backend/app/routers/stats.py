from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.services.cache import cache_get, cache_set

router = APIRouter()


class StarBucket(BaseModel):
    star: int
    percent: float


class SiteStats(BaseModel):
    total_reviews: int
    total_products: int
    avg_rating: float
    positive_pct: float
    star_distribution: list[StarBucket]


@router.get("", response_model=SiteStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    cache_key = "site:stats"
    if cached := await cache_get(cache_key):
        return cached

    total_products = (await db.execute(select(func.count()).select_from(Product))).scalar() or 0
    total_reviews  = (await db.execute(select(func.count()).select_from(Review))).scalar() or 0
    avg_rating     = (await db.execute(select(func.avg(Product.rating)))).scalar() or 0.0

    # Sentiment breakdown
    pos_count = (await db.execute(
        select(func.count()).select_from(Review).where(Review.sentiment == "positive")
    )).scalar() or 0
    positive_pct = round((pos_count / total_reviews * 100) if total_reviews else 0, 1)

    # Star distribution (round rating to nearest int)
    star_rows = (await db.execute(
        select(func.round(Review.rating).label("star"), func.count().label("cnt"))
        .group_by(func.round(Review.rating))
        .order_by(func.round(Review.rating).desc())
    )).all()

    star_dist: list[StarBucket] = []
    if total_reviews:
        counts = {int(r.star): r.cnt for r in star_rows if r.star}
        for s in range(5, 0, -1):
            pct = round(counts.get(s, 0) / total_reviews * 100, 1)
            star_dist.append(StarBucket(star=s, percent=pct))

    result = SiteStats(
        total_reviews=total_reviews,
        total_products=total_products,
        avg_rating=round(float(avg_rating), 1),
        positive_pct=positive_pct,
        star_distribution=star_dist,
    )

    await cache_set(cache_key, result.model_dump(), ttl=300)
    return result
