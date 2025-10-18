"""
Point d'entrée principal de l'API FastAPI iAsted
Configure l'application, les middlewares, et les routes
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
import time
import logging

from app.config import settings
from app.core.logging import setup_logging
from app.api.routes import api_router


setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    logger.info(f"🚀 Démarrage de {settings.app_name} v{settings.api_version}")
    logger.info(f"📍 Environnement: {settings.app_env}")
    
    yield
    
    logger.info(f"🛑 Arrêt de {settings.app_name}")


app = FastAPI(
    title=settings.app_name,
    description="Agent vocal intelligent multi-modal pour la plateforme anti-corruption Ndjobi",
    version=settings.api_version,
    docs_url=f"/api/{settings.api_version}/docs",
    redoc_url=f"/api/{settings.api_version}/redoc",
    openapi_url=f"/api/{settings.api_version}/openapi.json",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
)


app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Middleware pour tracker le temps de réponse"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Response-Time"] = f"{process_time:.4f}s"
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware pour logger les requêtes"""
    logger.info(
        f"📨 {request.method} {request.url.path}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None,
        }
    )
    response = await call_next(request)
    return response


if settings.prometheus_enabled:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint pour monitoring"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.api_version,
        "environment": settings.app_env
    }


@app.get("/", tags=["Root"])
async def root():
    """Point d'entrée racine de l'API"""
    return {
        "message": f"Bienvenue sur {settings.app_name} API",
        "version": settings.api_version,
        "docs": f"/api/{settings.api_version}/docs",
        "health": "/health",
        "metrics": "/metrics" if settings.prometheus_enabled else None
    }


app.include_router(api_router, prefix=f"/api/{settings.api_version}")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Gestionnaire global d'exceptions"""
    logger.error(
        f"❌ Erreur non gérée: {str(exc)}",
        exc_info=True,
        extra={
            "path": request.url.path,
            "method": request.method,
        }
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc) if settings.app_debug else "Une erreur est survenue",
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
        access_log=True
    )

