"""add composite_score column to products

Revision ID: 006
Revises: 005
Create Date: 2026-05-04
"""
from alembic import op
import sqlalchemy as sa

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('products', sa.Column('composite_score', sa.Float(), nullable=False, server_default='0.0'))
    op.create_index('ix_products_composite_score', 'products', ['composite_score'])


def downgrade() -> None:
    op.drop_index('ix_products_composite_score', table_name='products')
    op.drop_column('products', 'composite_score')
