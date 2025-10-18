"""
Métriques Prometheus pour monitoring
"""

from prometheus_client import Counter, Histogram, Gauge

stt_requests_total = Counter(
    'stt_requests_total',
    'Total STT requests',
    ['provider']
)

stt_latency_seconds = Histogram(
    'stt_latency_seconds',
    'STT latency in seconds',
    buckets=[0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 10.0]
)

llm_requests_total = Counter(
    'llm_requests_total',
    'Total LLM requests',
    ['provider']
)

llm_latency_seconds = Histogram(
    'llm_latency_seconds',
    'LLM latency in seconds',
    ['provider'],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
)

llm_tokens_total = Counter(
    'llm_tokens_total',
    'Total tokens used',
    ['provider', 'type']
)

llm_cost_dollars = Counter(
    'llm_cost_dollars',
    'Total LLM cost in dollars',
    ['provider']
)

tts_requests_total = Counter(
    'tts_requests_total',
    'Total TTS requests',
    ['provider']
)

tts_latency_seconds = Histogram(
    'tts_latency_seconds',
    'TTS latency in seconds',
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0]
)

cache_hits_total = Counter(
    'cache_hits_total',
    'Semantic cache hits'
)

cache_misses_total = Counter(
    'cache_misses_total',
    'Semantic cache misses'
)

websocket_connections = Gauge(
    'websocket_connections',
    'Active WebSocket connections'
)

api_requests_total = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status_code']
)

api_latency_seconds = Histogram(
    'api_latency_seconds',
    'API request latency',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)


def track_metrics(func):
    """Décorateur pour tracker automatiquement les métriques"""
    import time
    import asyncio
    from functools import wraps
    
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = await func(*args, **kwargs)
            return result
        finally:
            duration = time.time() - start
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            duration = time.time() - start
    
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper

