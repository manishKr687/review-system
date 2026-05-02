"""add is_suspicious flag to reviews

Revision ID: 003
Revises: 002
Create Date: 2026-05-03
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "reviews",
        sa.Column("is_suspicious", sa.Boolean, nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("reviews", "is_suspicious")
