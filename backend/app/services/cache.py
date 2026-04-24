import json
import logging

import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def cache_get(key: str) -> dict | list | None:
    try:
        raw = await get_redis().get(key)
        return json.loads(raw) if raw else None
    except Exception as e:
        logger.warning("Cache GET failed for %s: %s", key, e)
        return None


async def cache_set(key: str, value: dict | list, ttl: int | None = None) -> None:
    try:
        await get_redis().setex(key, ttl or settings.cache_ttl, json.dumps(value))
    except Exception as e:
        logger.warning("Cache SET failed for %s: %s", key, e)
