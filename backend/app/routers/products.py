from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductBase, ProductList, ProductsResponse
from app.services.cache import cache_get, cache_set

router = APIRouter()

SortOption = Literal["rating", "price_asc", "price_desc", "reviews"]

# Reusable ORDER BY expression — extracts scores->>'composite' as float
_COMPOSITE_DESC = text("(scores->>'composite')::float DESC NULLS LAST")


@router.get("", response_model=ProductsResponse)
async def list_products(
    category: str | None = None,
    min_rating: float = 0,
    max_price: float = 999999,
    sort: SortOption = "rating",
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"products:{category}:{min_rating}:{max_price}:{sort}:{limit}:{offset}"
    if cached := await cache_get(cache_key):
        return cached

    q = select(Product).where(
        Product.rating >= min_rating,
        Product.price <= max_price,
    )
    if category:
        q = q.where(Product.category == category)

    sort_col = {
        "rating":     _COMPOSITE_DESC,
        "price_asc":  Product.price.asc(),
        "price_desc": Product.price.desc(),
        "reviews":    Product.review_count.desc(),
    }[sort]

    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar_one()

    rows = (await db.execute(q.order_by(sort_col).limit(limit).offset(offset))).scalars().all()
    result = ProductsResponse(total=total, products=[ProductList.model_validate(r) for r in rows])

    await cache_set(cache_key, result.model_dump())
    return result


@router.get("/featured", response_model=ProductBase)
async def get_featured(db: AsyncSession = Depends(get_db)):
    if cached := await cache_get("product:featured"):
        return cached

    row = (await db.execute(
        select(Product).order_by(_COMPOSITE_DESC).limit(1)
    )).scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=404, detail="No products found")

    result = ProductBase.model_validate(row)
    await cache_set("product:featured", result.model_dump())
    return result


@router.get("/top-reviewed", response_model=list[ProductList])
async def top_reviewed(
    category: str | None = None,
    limit: int = 8,
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"products:top:{category}:{limit}"
    if cached := await cache_get(cache_key):
        return cached

    q = select(Product).order_by(_COMPOSITE_DESC)
    if category:
        q = q.where(Product.category == category)

    rows = (await db.execute(q.limit(limit))).scalars().all()
    result = [ProductList.model_validate(r) for r in rows]

    await cache_set(cache_key, [r.model_dump() for r in result])
    return result


@router.get("/{product_id}", response_model=ProductBase)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"product:{product_id}"
    if cached := await cache_get(cache_key):
        return cached

    row = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    result = ProductBase.model_validate(row)
    await cache_set(cache_key, result.model_dump())
    return result
