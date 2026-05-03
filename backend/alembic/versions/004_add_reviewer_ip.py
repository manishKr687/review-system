"""add reviewer_ip to reviews

Revision ID: 004
Revises: 003
Create Date: 2026-05-03
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "reviews",
        sa.Column("reviewer_ip", sa.String(45), nullable=True),
    )
    op.create_index("ix_reviews_reviewer_ip", "reviews", ["reviewer_ip"])


def downgrade() -> None:
    op.drop_index("ix_reviews_reviewer_ip", table_name="reviews")
    op.drop_column("reviews", "reviewer_ip")
