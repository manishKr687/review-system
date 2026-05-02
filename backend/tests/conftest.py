"""
Shared pytest fixtures.
Uses an in-memory SQLite database so tests run without Docker.
The async engine uses aiosqlite; the sync engine (for Celery tasks) uses sqlite3.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, SyncSessionLocal
from app.main import app
from app.database import get_db
from app.models.product import Product
from app.models.review import Review


TEST_ASYNC_URL = "sqlite+aiosqlite:///:memory:"
TEST_SYNC_URL  = "sqlite:///:memory:"

_async_engine = create_async_engine(TEST_ASYNC_URL, connect_args={"check_same_thread": False})
_async_session = async_sessionmaker(_async_engine, expire_on_commit=False)


@pytest.fixture(autouse=True)
async def reset_db():
    """Create all tables before each test, drop after."""
    async with _async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncSession:
    async with _async_session() as session:
        yield session


async def override_get_db():
    async with _async_session() as session:
        yield session


@pytest.fixture
async def client():
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


# ── Seed helpers ──────────────────────────────────────────────────────────────

@pytest.fixture
async def sample_product(db_session: AsyncSession) -> Product:
    p = Product(
        name="Test Phone", brand="TestBrand", category="Phones",
        price=499.0, rating=4.5, review_count=100,
        icon="📱", quote="A great phone",
        aspects={"camera": 4.5, "battery": 4.0},
        pros=["Fast", "Good camera"], cons=["Pricey"], highlights=["Best camera"],
    )
    db_session.add(p)
    await db_session.commit()
    await db_session.refresh(p)
    return p


@pytest.fixture
async def sample_review(db_session: AsyncSession, sample_product: Product) -> Review:
    r = Review(
        product_id=sample_product.id,
        author="Jane Doe", rating=5.0,
        body="Amazing product! The battery life is incredible.",
        sentiment="positive", verified=True, helpful=42,
        date="2024-01-15",
    )
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    return r
