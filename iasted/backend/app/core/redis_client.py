"""
Client Redis centralisé pour cache et sessions
"""

import logging
from typing import Optional
import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Client Redis singleton"""
    
    _instance: Optional[Redis] = None
    
    @classmethod
    async def get_instance(cls) -> Redis:
        """Retourne l'instance Redis (singleton)"""
        if cls._instance is None:
            cls._instance = await aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=settings.redis_decode_responses,
                max_connections=settings.redis_max_connections
            )
            logger.info("✅ Client Redis initialisé")
        
        return cls._instance
    
    @classmethod
    async def close(cls):
        """Ferme la connexion Redis"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None
            logger.info("🔌 Client Redis fermé")


def get_redis_client() -> Redis:
    """Dependency pour obtenir le client Redis"""
    return RedisClient.get_instance()

