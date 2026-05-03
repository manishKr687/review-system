import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


async def seed_products(db: AsyncSession, n: int = 3) -> list[Product]:
    products = [
        Product(
            name=f"Product {i}", brand=f"Brand {i % 2}",
            category="Phones" if i % 2 == 0 else "Laptops",
            price=100.0 * i, rating=3.0 + (i * 0.5 % 2),
            review_count=i * 10, icon="📱", quote=f"Quote {i}",
            aspects={}, pros=[], cons=[], highlights=[],
            composite_score=(3.0 + (i * 0.5 % 2)) / 5.0,
        )
        for i in range(1, n + 1)
    ]
    for p in products:
        db.add(p)
    await db.commit()
    return products


class TestListProducts:

    async def test_returns_empty_list_with_no_data(self, client: AsyncClient):
        res = await client.get("/api/products")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == 0
        assert data["products"] == []

    async def test_returns_all_products(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 3)
        res = await client.get("/api/products")
        assert res.status_code == 200
        assert res.json()["total"] == 3

    async def test_filters_by_category(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 4)
        res = await client.get("/api/products?category=Phones")
        assert res.status_code == 200
        for p in res.json()["products"]:
            assert p["category"] == "Phones"

    async def test_filters_by_min_rating(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 4)
        res = await client.get("/api/products?min_rating=4.0")
        assert res.status_code == 200
        for p in res.json()["products"]:
            assert p["rating"] >= 4.0

    async def test_respects_limit(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 5)
        res = await client.get("/api/products?limit=2")
        assert res.status_code == 200
        assert len(res.json()["products"]) == 2

    async def test_sort_by_price_asc(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 3)
        res = await client.get("/api/products?sort=price_asc")
        assert res.status_code == 200
        prices = [p["price"] for p in res.json()["products"]]
        assert prices == sorted(prices)


class TestFeaturedProduct:

    async def test_returns_404_with_no_data(self, client: AsyncClient):
        res = await client.get("/api/products/featured")
        assert res.status_code == 404

    async def test_returns_highest_rated_product(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 3)
        res = await client.get("/api/products/featured")
        assert res.status_code == 200
        data = res.json()
        assert "name" in data
        assert "rating" in data


class TestGetProduct:

    async def test_returns_product_by_id(self, client: AsyncClient, sample_product: Product):
        res = await client.get(f"/api/products/{sample_product.id}")
        assert res.status_code == 200
        data = res.json()
        assert data["name"] == "Test Phone"
        assert data["brand"] == "TestBrand"

    async def test_returns_404_for_unknown_id(self, client: AsyncClient):
        res = await client.get("/api/products/99999")
        assert res.status_code == 404

    async def test_includes_pros_cons_highlights(self, client: AsyncClient, sample_product: Product):
        res = await client.get(f"/api/products/{sample_product.id}")
        assert res.status_code == 200
        data = res.json()
        assert "pros" in data
        assert "cons" in data
        assert "highlights" in data
        assert data["pros"] == ["Fast", "Good camera"]


class TestTopReviewed:

    async def test_returns_products_ordered_by_rating(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 4)
        res = await client.get("/api/products/top-reviewed")
        assert res.status_code == 200
        ratings = [p["rating"] for p in res.json()]
        assert ratings == sorted(ratings, reverse=True)

    async def test_respects_limit_param(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 5)
        res = await client.get("/api/products/top-reviewed?limit=2")
        assert res.status_code == 200
        assert len(res.json()) <= 2

    async def test_filters_by_category(self, client: AsyncClient, db_session: AsyncSession):
        await seed_products(db_session, 4)
        res = await client.get("/api/products/top-reviewed?category=Phones")
        assert res.status_code == 200
        for p in res.json():
            assert p["category"] == "Phones"


class TestSearch:

    async def test_returns_matching_products(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/search?q=Test")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 1
        assert any(p["name"] == "Test Phone" for p in data["products"])

    async def test_returns_empty_for_no_match(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/search?q=xyznotexist")
        assert res.status_code == 200
        assert res.json()["total"] == 0

    async def test_searches_by_brand(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/search?q=TestBrand")
        assert res.status_code == 200
        assert res.json()["total"] >= 1
