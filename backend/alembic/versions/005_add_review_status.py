"""add status column to reviews

Revision ID: 005
Revises: 004
Create Date: 2026-05-03
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "reviews",
        sa.Column("status", sa.String(20), nullable=False, server_default="approved"),
    )
    op.create_index("ix_reviews_status", "reviews", ["status"])


def downgrade() -> None:
    op.drop_index("ix_reviews_status", table_name="reviews")
    op.drop_column("reviews", "status")
