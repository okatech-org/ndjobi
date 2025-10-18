"""
Endpoints pour la gestion des conversations
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime

from app.core.auth import get_current_user, check_permission

logger = logging.getLogger(__name__)
router = APIRouter()


class Conversation(BaseModel):
    """Modèle de conversation"""
    id: str
    user_id: str
    session_id: str
    created_at: datetime
    updated_at: datetime
    turns_count: int
    status: str = "active"


class ConversationDetail(Conversation):
    """Détails complets d'une conversation"""
    turns: List[dict]


@router.get("/", response_model=List[Conversation], tags=["Conversations"])
async def list_conversations(
    current_user = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Liste les conversations de l'utilisateur
    
    Args:
        limit: Nombre max de résultats
        offset: Décalage pour pagination
        
    Returns:
        List[Conversation]: Liste de conversations
    """
    logger.info(f"📚 Liste conversations: user={current_user['id']}")
    
    conversations = []
    
    return conversations


@router.get("/{conversation_id}", response_model=ConversationDetail, tags=["Conversations"])
async def get_conversation(
    conversation_id: str,
    current_user = Depends(get_current_user)
):
    """
    Récupère les détails d'une conversation
    
    Args:
        conversation_id: ID de la conversation
        
    Returns:
        ConversationDetail: Détails complets
    """
    logger.info(f"📖 Récupération conversation: id={conversation_id}")
    
    raise HTTPException(status_code=404, detail="Conversation non trouvée")


@router.delete("/{conversation_id}", tags=["Conversations"])
async def delete_conversation(
    conversation_id: str,
    current_user = Depends(get_current_user)
):
    """
    Supprime une conversation
    
    Args:
        conversation_id: ID de la conversation
        
    Returns:
        dict: Message de confirmation
    """
    if not check_permission(current_user["role"], "conversations", "delete"):
        raise HTTPException(
            status_code=403,
            detail="Permission insuffisante"
        )
    
    logger.info(f"🗑️ Suppression conversation: id={conversation_id}")
    
    return {"message": "Conversation supprimée", "id": conversation_id}

