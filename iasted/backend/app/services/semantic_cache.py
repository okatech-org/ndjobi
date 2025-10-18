"""
Service de cache sémantique avec Redis
Utilise des embeddings pour trouver des réponses similaires et éviter les appels LLM redondants
"""

import logging
import hashlib
import json
from typing import Optional, List, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
from redis.asyncio import Redis

from app.config import settings
from app.core.redis_client import get_redis_client

logger = logging.getLogger(__name__)


class SemanticCache:
    """Cache sémantique avec similarité vectorielle"""
    
    def __init__(self):
        """Initialise le cache sémantique"""
        self.redis: Redis = None
        self.encoder = SentenceTransformer(
            'sentence-transformers/paraphrase-multilingual-mpnet-base-v2'
        )
        self.similarity_threshold = settings.semantic_cache_threshold
        self.cache_ttl = settings.semantic_cache_ttl
        self.enabled = settings.semantic_cache_enabled
        
        logger.info(f"✅ Cache sémantique initialisé (seuil={self.similarity_threshold})")
    
    async def initialize(self):
        """Initialise la connexion Redis"""
        if not self.redis:
            self.redis = await get_redis_client()
    
    def _get_embedding(self, text: str) -> List[float]:
        """
        Génère l'embedding vectoriel d'un texte
        
        Args:
            text: Texte à encoder
            
        Returns:
            List[float]: Vecteur d'embedding
        """
        embedding = self.encoder.encode(text)
        return embedding.tolist()
    
    def _compute_similarity(self, emb1: List[float], emb2: List[float]) -> float:
        """
        Calcule la similarité cosine entre deux embeddings
        
        Args:
            emb1: Premier embedding
            emb2: Deuxième embedding
            
        Returns:
            float: Score de similarité (0-1)
        """
        vec1 = np.array(emb1)
        vec2 = np.array(emb2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        return float(similarity)
    
    async def get(self, query: str, user_context: dict = None) -> Optional[Tuple[str, float]]:
        """
        Cherche une réponse cachée similaire à la requête
        
        Args:
            query: Requête utilisateur
            user_context: Contexte utilisateur (rôle, etc.)
            
        Returns:
            Optional[Tuple[str, float]]: (réponse, score_similarité) ou None
        """
        if not self.enabled:
            return None
        
        await self.initialize()
        
        try:
            query_embedding = self._get_embedding(query)
            
            cache_keys = []
            async for key in self.redis.scan_iter(match="cache:*", count=100):
                cache_keys.append(key)
            
            best_match = None
            best_score = 0.0
            
            for key in cache_keys:
                cached_data = await self.redis.get(key)
                if not cached_data:
                    continue
                
                try:
                    cache_entry = json.loads(cached_data)
                    cached_embedding = cache_entry.get("embedding")
                    
                    if not cached_embedding:
                        continue
                    
                    similarity = self._compute_similarity(query_embedding, cached_embedding)
                    
                    if similarity > best_score:
                        best_score = similarity
                        best_match = cache_entry.get("response")
                
                except json.JSONDecodeError:
                    continue
            
            if best_match and best_score >= self.similarity_threshold:
                logger.info(f"✅ Cache hit! Similarité: {best_score:.3f}")
                return best_match, best_score
            
            logger.debug(f"❌ Cache miss. Meilleur score: {best_score:.3f}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Erreur cache sémantique get: {e}", exc_info=True)
            return None
    
    async def set(
        self,
        query: str,
        response: str,
        user_context: dict = None,
        ttl: Optional[int] = None
    ):
        """
        Cache une paire requête/réponse avec embedding
        
        Args:
            query: Requête utilisateur
            response: Réponse LLM
            user_context: Contexte utilisateur
            ttl: Durée de vie (défaut: settings.semantic_cache_ttl)
        """
        if not self.enabled:
            return
        
        await self.initialize()
        
        try:
            query_embedding = self._get_embedding(query)
            
            cache_key = f"cache:{hashlib.md5(query.encode()).hexdigest()}"
            
            cache_entry = {
                "query": query,
                "response": response,
                "embedding": query_embedding,
                "user_context": user_context or {},
                "timestamp": str(np.datetime64('now'))
            }
            
            ttl = ttl or self.cache_ttl
            
            await self.redis.setex(
                cache_key,
                ttl,
                json.dumps(cache_entry)
            )
            
            logger.debug(f"✅ Réponse cachée: {query[:50]}... (TTL={ttl}s)")
            
        except Exception as e:
            logger.error(f"❌ Erreur cache sémantique set: {e}", exc_info=True)
    
    async def clear_user_cache(self, user_id: str):
        """
        Efface le cache d'un utilisateur spécifique
        
        Args:
            user_id: ID utilisateur
        """
        await self.initialize()
        
        try:
            cache_keys = []
            async for key in self.redis.scan_iter(match="cache:*", count=100):
                cached_data = await self.redis.get(key)
                if cached_data:
                    try:
                        cache_entry = json.loads(cached_data)
                        if cache_entry.get("user_context", {}).get("user_id") == user_id:
                            cache_keys.append(key)
                    except json.JSONDecodeError:
                        pass
            
            if cache_keys:
                await self.redis.delete(*cache_keys)
                logger.info(f"🗑️ Cache effacé pour user {user_id}: {len(cache_keys)} entrées")
                
        except Exception as e:
            logger.error(f"❌ Erreur clear_user_cache: {e}", exc_info=True)
    
    async def get_stats(self) -> dict:
        """
        Retourne les statistiques du cache
        
        Returns:
            dict: Statistiques (nb entrées, taille, etc.)
        """
        await self.initialize()
        
        try:
            cache_keys = []
            async for key in self.redis.scan_iter(match="cache:*"):
                cache_keys.append(key)
            
            total_size = 0
            for key in cache_keys:
                cached_data = await self.redis.get(key)
                if cached_data:
                    total_size += len(cached_data)
            
            return {
                "total_entries": len(cache_keys),
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / 1024 / 1024, 2),
                "threshold": self.similarity_threshold,
                "enabled": self.enabled
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur get_stats: {e}", exc_info=True)
            return {"error": str(e)}

