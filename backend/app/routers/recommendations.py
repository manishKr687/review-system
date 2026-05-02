from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductList
from app.services.cache import cache_get, cache_set

router = APIRouter()

RecommendationType = Literal[
    "top_rated", "best_value", "trending", "gaming", "photography", "travel"
]

# Aspect keys used for use-case scoring
_USE_CASE_ASPECTS: dict[str, list[str]] = {
    "gaming":       ["performance", "display"],
    "photography":  ["camera"],
    "travel":       ["battery", "build"],
}


def _usecase_score(aspects: dict, keys: list[str]) -> float:
    vals = [float(aspects.get(k, 0)) for k in keys if aspects.get(k)]
    return sum(vals) / len(vals) if vals else 0.0


@router.get("", response_model=list[ProductList])
async def get_recommendations(
    type: RecommendationType = "top_rated",
    category: str | None = None,
    limit: int = 8,
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"rec:{type}:{category}:{limit}"
    if cached := await cache_get(cache_key):
        return cached

    q = select(Product)
    if category:
        q = q.where(Product.category == category)

    rows = (await db.execute(q)).scalars().all()

    def sort_key(p: Product) -> float:
        s = p.scores or {}
        if type == "top_rated":
            return s.get("composite", 0.0)
        if type == "best_value":
            return s.get("value", 0.0)
        if type == "trending":
            return s.get("recency", 0.0) * 0.6 + s.get("composite", 0.0) * 0.4
        # Use-case types
        return _usecase_score(p.aspects or {}, _USE_CASE_ASPECTS[type])

    ranked = sorted(rows, key=sort_key, reverse=True)[:limit]
    result = [ProductList.model_validate(r) for r in ranked]

    await cache_set(cache_key, [r.model_dump() for r in result], ttl=600)
    return result
