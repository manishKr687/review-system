from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.services.cache import cache_delete_prefix
from app.tasks.analysis import analyse_all_reviews

router = APIRouter()


# ── Auth ─────────────────────────────────────────────────────────────────────

def require_admin(x_admin_key: str = Header(...)):
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin key")


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    brand: str
    category: str
    price: float
    rating: float
    review_count: int = 0
    icon: str = "📦"
    quote: str = ""
    aspects: dict = {}
    pros: list[str] = []
    cons: list[str] = []
    highlights: list[str] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    brand: str | None = None
    category: str | None = None
    price: float | None = None
    rating: float | None = None
    review_count: int | None = None
    icon: str | None = None
    quote: str | None = None
    aspects: dict | None = None
    pros: list[str] | None = None
    cons: list[str] | None = None
    highlights: list[str] | None = None


class AdminProduct(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    price: float
    rating: float
    review_count: int
    icon: str
    quote: str
    aspects: dict
    pros: list[str]
    cons: list[str]
    highlights: list[str]
    model_config = {"from_attributes": True}


class AdminStats(BaseModel):
    total_products: int
    total_reviews: int
    sentiment_breakdown: dict[str, int]
    categories: dict[str, int]


class AnalyseResponse(BaseModel):
    task_id: str
    status: str
    message: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats, dependencies=[Depends(require_admin)])
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_products = (await db.execute(select(func.count()).select_from(Product))).scalar_one()
    total_reviews = (await db.execute(select(func.count()).select_from(Review))).scalar_one()

    sentiment_rows = (await db.execute(
        select(Review.sentiment, func.count()).group_by(Review.sentiment)
    )).all()
    sentiment_breakdown = {row[0] or "neutral": row[1] for row in sentiment_rows}

    category_rows = (await db.execute(
        select(Product.category, func.count()).group_by(Product.category).order_by(func.count().desc())
    )).all()
    categories = {row[0]: row[1] for row in category_rows}

    return AdminStats(
        total_products=total_products,
        total_reviews=total_reviews,
        sentiment_breakdown=sentiment_breakdown,
        categories=categories,
    )


@router.get("/products", response_model=list[AdminProduct], dependencies=[Depends(require_admin)])
async def list_products(
    category: str | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    q = select(Product).order_by(Product.id)
    if category:
        q = q.where(Product.category == category)
    if search:
        term = f"%{search.lower()}%"
        q = q.where(
            func.lower(Product.name).like(term) | func.lower(Product.brand).like(term)
        )
    rows = (await db.execute(q.limit(limit).offset(offset))).scalars().all()
    return [AdminProduct.model_validate(r) for r in rows]


@router.post("/products", response_model=AdminProduct, status_code=201, dependencies=[Depends(require_admin)])
async def create_product(body: ProductCreate, db: AsyncSession = Depends(get_db)):
    product = Product(**body.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    await cache_delete_prefix("products:")
    return AdminProduct.model_validate(product)


@router.put("/products/{product_id}", response_model=AdminProduct, dependencies=[Depends(require_admin)])
async def update_product(product_id: int, body: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    await cache_delete_prefix(f"product:{product_id}")
    await cache_delete_prefix("products:")
    return AdminProduct.model_validate(product)


@router.delete("/products/{product_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    await db.commit()
    await cache_delete_prefix(f"product:{product_id}")
    await cache_delete_prefix("products:")


@router.post("/analyse", response_model=AnalyseResponse, dependencies=[Depends(require_admin)])
async def trigger_analysis():
    task = analyse_all_reviews.delay()
    return AnalyseResponse(
        task_id=task.id,
        status="queued",
        message="NLP re-analysis started. Poll /api/analyse/status/{task_id} for progress.",
    )
