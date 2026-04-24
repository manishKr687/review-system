from fastapi import APIRouter, Depends
from sqlalchemy import distinct, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.services.cache import cache_get, cache_set

router = APIRouter()

CATEGORY_ICONS = {
    "Phones": "📱",
    "Laptops": "💻",
    "Headphones": "🎧",
    "Smartwatches": "⌚",
    "Cameras": "📷",
    "Tablets": "📲",
}


@router.get("")
async def list_categories(db: AsyncSession = Depends(get_db)):
    if cached := await cache_get("categories"):
        return cached

    rows = (await db.execute(select(distinct(Product.category)).order_by(Product.category))).scalars().all()
    result = [{"name": cat, "icon": CATEGORY_ICONS.get(cat, "📦")} for cat in rows]

    await cache_set("categories", result, ttl=3600)
    return result
