"""add scores column to products

Revision ID: 002
Create Date: 2026-05-03
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("scores", sa.JSON, nullable=True, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("products", "scores")
