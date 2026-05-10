"""add users table and user_id to reviews

Revision ID: 008
Revises: 007
Create Date: 2026-05-11
"""
from alembic import op
import sqlalchemy as sa

revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    op.add_column('reviews', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_reviews_user_id', 'reviews', 'users', ['user_id'], ['id'])
    op.create_index('ix_reviews_user_id', 'reviews', ['user_id'])


def downgrade():
    op.drop_index('ix_reviews_user_id', table_name='reviews')
    op.drop_constraint('fk_reviews_user_id', 'reviews', type_='foreignkey')
    op.drop_column('reviews', 'user_id')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
