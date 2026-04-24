from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductList, ProductsResponse
from app.services.cache import cache_get, cache_set

router = APIRouter()


@router.get("", response_model=ProductsResponse)
async def search(q: str = "", db: AsyncSession = Depends(get_db)):
    if not q.strip():
        return ProductsResponse(total=0, products=[])

    cache_key = f"search:{q.lower().strip()}"
    if cached := await cache_get(cache_key):
        return cached

    pattern = f"%{q.strip()}%"
    stmt = (
        select(Product)
        .where(
            or_(
                Product.name.ilike(pattern),
                Product.brand.ilike(pattern),
                Product.category.ilike(pattern),
                Product.quote.ilike(pattern),
            )
        )
        .order_by(Product.rating.desc())
        .limit(30)
    )

    rows = (await db.execute(stmt)).scalars().all()
    result = ProductsResponse(total=len(rows), products=[ProductList.model_validate(r) for r in rows])

    await cache_set(cache_key, result.model_dump(), ttl=120)
    return result
