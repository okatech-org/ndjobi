"""
Router principal de l'API
Regroupe tous les endpoints de l'application
"""

from fastapi import APIRouter

from app.api.endpoints import auth, voice, conversations, artifacts, admin

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    voice.router,
    prefix="/voice",
    tags=["Voice"]
)

api_router.include_router(
    conversations.router,
    prefix="/conversations",
    tags=["Conversations"]
)

api_router.include_router(
    artifacts.router,
    prefix="/artifacts",
    tags=["Artifacts"]
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Administration"]
)

