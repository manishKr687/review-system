from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.schemas.review import AdminReviewOut
from app.services.cache import cache_delete_prefix
from app.tasks.analysis import analyse_all_reviews
from app.tasks.scoring import compute_all_scores

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


@router.post("/compute-scores", response_model=AnalyseResponse, dependencies=[Depends(require_admin)])
async def trigger_scoring():
    task = compute_all_scores.delay()
    return AnalyseResponse(
        task_id=task.id,
        status="queued",
        message="Score computation started. Poll /api/analyse/status/{task_id} for progress.",
    )


# ── Review moderation ─────────────────────────────────────────────────────────

class ModerationCount(BaseModel):
    pending: int


@router.get("/reviews/pending/count", response_model=ModerationCount, dependencies=[Depends(require_admin)])
async def pending_count(db: AsyncSession = Depends(get_db)):
    n = (await db.execute(
        select(func.count()).select_from(Review).where(Review.status == "pending")
    )).scalar_one()
    return ModerationCount(pending=n)


@router.get("/reviews/pending", response_model=list[AdminReviewOut], dependencies=[Depends(require_admin)])
async def list_pending_reviews(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Review, Product.name.label("product_name"))
        .join(Product, Review.product_id == Product.id)
        .where(Review.status == "pending")
        .order_by(Review.id.asc())
    )).all()
    result = []
    for review, product_name in rows:
        out = AdminReviewOut(
            id=review.id,
            product_id=review.product_id,
            product_name=product_name,
            author=review.author,
            rating=review.rating,
            title=review.title,
            body=review.body,
            sentiment=review.sentiment,
            verified=review.verified,
            helpful=review.helpful,
            date=review.date,
            is_suspicious=review.is_suspicious,
            status=review.status,
            reviewer_ip=review.reviewer_ip,
        )
        result.append(out)
    return result


class ApproveBody(BaseModel):
    verified: bool = False


@router.post("/reviews/{review_id}/approve", response_model=AdminReviewOut, dependencies=[Depends(require_admin)])
async def approve_review(review_id: int, body: ApproveBody, db: AsyncSession = Depends(get_db)):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    product = await db.get(Product, review.product_id)
    review.status = "approved"
    review.verified = body.verified

    if product:
        # Recalculate rolling rating including this newly approved review
        approved = (await db.execute(
            select(Review).where(Review.product_id == product.id, Review.status == "approved")
        )).scalars().all()
        product.review_count = len(approved)
        product.rating = round(sum(r.rating for r in approved) / len(approved), 1) if approved else 0.0

        await db.refresh(product)
        from app.routers.reviews import _recompute_aspects, _recompute_scores
        await _recompute_aspects(product, db)
        await _recompute_scores(product, db)

    await db.commit()
    await db.refresh(review)
    await cache_delete_prefix(f"reviews:{review.product_id}:")
    await cache_delete_prefix(f"product:{review.product_id}")

    product_name = product.name if product else ""
    return AdminReviewOut(
        id=review.id, product_id=review.product_id, product_name=product_name,
        author=review.author, rating=review.rating, title=review.title, body=review.body,
        sentiment=review.sentiment, verified=review.verified, helpful=review.helpful,
        date=review.date, is_suspicious=review.is_suspicious, status=review.status,
        reviewer_ip=review.reviewer_ip,
    )


@router.post("/reviews/{review_id}/reject", response_model=AdminReviewOut, dependencies=[Depends(require_admin)])
async def reject_review(review_id: int, db: AsyncSession = Depends(get_db)):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = "rejected"
    await db.commit()
    await db.refresh(review)
    await cache_delete_prefix(f"reviews:{review.product_id}:")

    product = await db.get(Product, review.product_id)
    product_name = product.name if product else ""
    return AdminReviewOut(
        id=review.id, product_id=review.product_id, product_name=product_name,
        author=review.author, rating=review.rating, title=review.title, body=review.body,
        sentiment=review.sentiment, verified=review.verified, helpful=review.helpful,
        date=review.date, is_suspicious=review.is_suspicious, status=review.status,
        reviewer_ip=review.reviewer_ip,
    )


@router.delete("/reviews/{review_id}", status_code=204, dependencies=[Depends(require_admin)])
async def admin_delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    product_id = review.product_id
    await db.delete(review)
    await db.commit()
    await cache_delete_prefix(f"reviews:{product_id}:")
