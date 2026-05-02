"""initial schema

Revision ID: 001
Create Date: 2026-04-24
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("brand", sa.String(100), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("price", sa.Float, nullable=False),
        sa.Column("rating", sa.Float, nullable=False),
        sa.Column("review_count", sa.Integer, default=0),
        sa.Column("icon", sa.String(10), default="📦"),
        sa.Column("quote", sa.String(500), default=""),
        sa.Column("aspects", sa.JSON, default={}),
        sa.Column("pros", sa.JSON, default=[]),
        sa.Column("cons", sa.JSON, default=[]),
        sa.Column("highlights", sa.JSON, default=[]),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=False),
        sa.Column("author", sa.String(100), nullable=False),
        sa.Column("rating", sa.Float, nullable=False),
        sa.Column("title", sa.String(200), default=""),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("sentiment", sa.String(20), default="neutral"),
        sa.Column("verified", sa.Boolean, default=False),
        sa.Column("helpful", sa.Integer, default=0),
        sa.Column("date", sa.String(20), default=""),
    )
    op.create_index("ix_reviews_product_id", "reviews", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_reviews_product_id", "reviews")
    op.drop_table("reviews")
    op.drop_table("products")
