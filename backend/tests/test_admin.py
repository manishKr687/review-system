import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


ADMIN_KEY = "reviewlens-admin"
BAD_KEY   = "wrong-key"
HEADERS   = {"x-admin-key": ADMIN_KEY}


class TestAdminAuth:

    async def test_stats_requires_key(self, client: AsyncClient):
        res = await client.get("/api/admin/stats")
        assert res.status_code == 422  # missing required header

    async def test_stats_rejects_wrong_key(self, client: AsyncClient):
        res = await client.get("/api/admin/stats", headers={"x-admin-key": BAD_KEY})
        assert res.status_code == 401

    async def test_stats_accepts_correct_key(self, client: AsyncClient):
        res = await client.get("/api/admin/stats", headers=HEADERS)
        assert res.status_code == 200


class TestAdminStats:

    async def test_returns_zero_counts_on_empty_db(self, client: AsyncClient):
        res = await client.get("/api/admin/stats", headers=HEADERS)
        assert res.status_code == 200
        data = res.json()
        assert data["total_products"] == 0
        assert data["total_reviews"] == 0

    async def test_counts_products(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/admin/stats", headers=HEADERS)
        assert res.json()["total_products"] == 1

    async def test_counts_reviews(self, client: AsyncClient, sample_review):
        res = await client.get("/api/admin/stats", headers=HEADERS)
        assert res.json()["total_reviews"] == 1

    async def test_includes_sentiment_breakdown(self, client: AsyncClient, sample_review):
        res = await client.get("/api/admin/stats", headers=HEADERS)
        assert "sentiment_breakdown" in res.json()
        assert "positive" in res.json()["sentiment_breakdown"]

    async def test_includes_categories(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/admin/stats", headers=HEADERS)
        assert "categories" in res.json()
        assert "Phones" in res.json()["categories"]


class TestAdminListProducts:

    async def test_returns_all_products(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/admin/products", headers=HEADERS)
        assert res.status_code == 200
        assert len(res.json()) == 1

    async def test_search_by_name(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/admin/products?search=Test", headers=HEADERS)
        assert res.status_code == 200
        assert len(res.json()) == 1

    async def test_search_no_match_returns_empty(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/admin/products?search=xyz", headers=HEADERS)
        assert res.json() == []

    async def test_filter_by_category(self, client: AsyncClient, sample_product: Product):
        res = await client.get("/api/admin/products?category=Phones", headers=HEADERS)
        assert res.status_code == 200
        assert all(p["category"] == "Phones" for p in res.json())


class TestAdminCreateProduct:

    async def test_creates_product(self, client: AsyncClient):
        payload = {
            "name": "New Phone", "brand": "NewBrand", "category": "Phones",
            "price": 599.0, "rating": 4.2, "review_count": 0,
            "icon": "📱", "quote": "Nice phone",
        }
        res = await client.post("/api/admin/products", json=payload, headers=HEADERS)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "New Phone"
        assert data["id"] is not None

    async def test_created_product_appears_in_list(self, client: AsyncClient):
        payload = {
            "name": "Unique Phone X", "brand": "BrandX", "category": "Phones",
            "price": 399.0, "rating": 4.0, "review_count": 0, "icon": "📱", "quote": "",
        }
        await client.post("/api/admin/products", json=payload, headers=HEADERS)
        res = await client.get("/api/admin/products?search=Unique+Phone+X", headers=HEADERS)
        assert len(res.json()) == 1

    async def test_requires_admin_key(self, client: AsyncClient):
        res = await client.post("/api/admin/products", json={}, headers={"x-admin-key": BAD_KEY})
        assert res.status_code == 401


class TestAdminUpdateProduct:

    async def test_updates_product_name(self, client: AsyncClient, sample_product: Product):
        res = await client.put(
            f"/api/admin/products/{sample_product.id}",
            json={"name": "Updated Name"},
            headers=HEADERS,
        )
        assert res.status_code == 200
        assert res.json()["name"] == "Updated Name"

    async def test_partial_update_leaves_other_fields(self, client: AsyncClient, sample_product: Product):
        res = await client.put(
            f"/api/admin/products/{sample_product.id}",
            json={"price": 999.0},
            headers=HEADERS,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["price"] == 999.0
        assert data["name"] == sample_product.name  # unchanged

    async def test_returns_404_for_unknown_id(self, client: AsyncClient):
        res = await client.put(
            "/api/admin/products/99999",
            json={"name": "Ghost"},
            headers=HEADERS,
        )
        assert res.status_code == 404


class TestAdminDeleteProduct:

    async def test_deletes_product(self, client: AsyncClient, sample_product: Product):
        res = await client.delete(f"/api/admin/products/{sample_product.id}", headers=HEADERS)
        assert res.status_code == 204

    async def test_product_gone_after_delete(self, client: AsyncClient, sample_product: Product):
        await client.delete(f"/api/admin/products/{sample_product.id}", headers=HEADERS)
        res = await client.get(f"/api/products/{sample_product.id}")
        assert res.status_code == 404

    async def test_returns_404_for_unknown_id(self, client: AsyncClient):
        res = await client.delete("/api/admin/products/99999", headers=HEADERS)
        assert res.status_code == 404
