from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Synchronous engine for Celery tasks (asyncpg → psycopg2 URL swap)
_sync_url = settings.database_url.replace("+asyncpg", "")
sync_engine = create_engine(_sync_url, echo=False)
SyncSessionLocal = sessionmaker(sync_engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
