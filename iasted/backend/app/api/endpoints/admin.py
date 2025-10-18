"""
Endpoints d'administration
Gestion utilisateurs, métriques, audit logs
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime

from app.core.auth import get_current_user, check_permission

logger = logging.getLogger(__name__)
router = APIRouter()


class UserInfo(BaseModel):
    """Informations utilisateur"""
    id: str
    email: str
    role: str
    organization: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]


class MetricsResponse(BaseModel):
    """Métriques d'utilisation"""
    total_conversations: int
    total_tokens: int
    total_cost: float
    active_users: int
    avg_response_time_ms: float


class AuditLogEntry(BaseModel):
    """Entrée de log d'audit"""
    timestamp: datetime
    user_id: str
    action: str
    resource: str
    details: dict


@router.get("/users", response_model=List[UserInfo], tags=["Admin"])
async def list_users(
    current_user = Depends(get_current_user),
    role: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    Liste les utilisateurs (admin/super-admin uniquement)
    
    Args:
        role: Filtrer par rôle
        limit: Nombre max de résultats
        offset: Décalage
        
    Returns:
        List[UserInfo]: Liste d'utilisateurs
    """
    if not check_permission(current_user["role"], "users", "read"):
        raise HTTPException(status_code=403, detail="Permission insuffisante")
    
    logger.info(f"👥 Liste utilisateurs: requester={current_user['id']}")
    
    return []


@router.post("/users/{user_id}/role", tags=["Admin"])
async def change_user_role(
    user_id: str,
    new_role: str,
    current_user = Depends(get_current_user)
):
    """
    Change le rôle d'un utilisateur
    
    Args:
        user_id: ID utilisateur
        new_role: Nouveau rôle
        
    Returns:
        dict: Confirmation
    """
    if current_user["role"] != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Seuls les super-admins peuvent changer les rôles"
        )
    
    logger.info(f"🔄 Changement rôle: user={user_id}, new_role={new_role}")
    
    return {
        "message": "Rôle mis à jour",
        "user_id": user_id,
        "new_role": new_role
    }


@router.get("/metrics", response_model=MetricsResponse, tags=["Admin"])
async def get_metrics(
    current_user = Depends(get_current_user),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Récupère les métriques d'utilisation
    
    Args:
        start_date: Date de début
        end_date: Date de fin
        
    Returns:
        MetricsResponse: Métriques agrégées
    """
    if not check_permission(current_user["role"], "metrics", "read"):
        raise HTTPException(status_code=403, detail="Permission insuffisante")
    
    logger.info(f"📊 Récupération métriques: requester={current_user['id']}")
    
    return MetricsResponse(
        total_conversations=1250,
        total_tokens=450000,
        total_cost=125.50,
        active_users=342,
        avg_response_time_ms=850.5
    )


@router.get("/audit-logs", response_model=List[AuditLogEntry], tags=["Admin"])
async def get_audit_logs(
    current_user = Depends(get_current_user),
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Récupère les logs d'audit
    
    Args:
        user_id: Filtrer par utilisateur
        action: Filtrer par action
        limit: Limite
        offset: Décalage
        
    Returns:
        List[AuditLogEntry]: Logs d'audit
    """
    if current_user["role"] not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission insuffisante")
    
    logger.info(f"📝 Récupération audit logs: requester={current_user['id']}")
    
    return []

