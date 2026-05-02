import pytest
from httpx import AsyncClient

from app.models.review import Review


class TestGetReviews:

    async def test_returns_reviews_for_product(
        self, client: AsyncClient, sample_review: Review
    ):
        res = await client.get(f"/api/reviews/{sample_review.product_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 1
        assert data["reviews"][0]["author"] == "Jane Doe"

    async def test_returns_empty_for_unknown_product(self, client: AsyncClient):
        res = await client.get("/api/reviews/99999")
        assert res.status_code == 200
        assert res.json()["total"] == 0

    async def test_filters_by_positive_sentiment(
        self, client: AsyncClient, sample_review: Review
    ):
        res = await client.get(f"/api/reviews/{sample_review.product_id}?sentiment=positive")
        assert res.status_code == 200
        for r in res.json()["reviews"]:
            assert r["sentiment"] == "positive"

    async def test_filters_verified_only(
        self, client: AsyncClient, sample_review: Review
    ):
        res = await client.get(f"/api/reviews/{sample_review.product_id}?verified_only=true")
        assert res.status_code == 200
        for r in res.json()["reviews"]:
            assert r["verified"] is True

    async def test_review_fields_present(
        self, client: AsyncClient, sample_review: Review
    ):
        res = await client.get(f"/api/reviews/{sample_review.product_id}")
        assert res.status_code == 200
        review = res.json()["reviews"][0]
        for field in ("id", "product_id", "author", "rating", "body", "sentiment", "verified", "helpful"):
            assert field in review

    async def test_negative_sentiment_filter_returns_empty_when_none(
        self, client: AsyncClient, sample_review: Review
    ):
        # sample_review is positive — asking for negative should return 0
        res = await client.get(f"/api/reviews/{sample_review.product_id}?sentiment=negative")
        assert res.status_code == 200
        assert res.json()["total"] == 0
