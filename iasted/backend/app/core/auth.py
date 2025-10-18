"""
Système d'authentification OAuth2 + PKCE et RBAC
Intégration avec Supabase pour réutiliser l'auth Ndjobi
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import JWTError, jwt
import secrets
import hashlib

from app.config import settings

logger = logging.getLogger(__name__)


oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"/api/{settings.api_version}/auth/authorize",
    tokenUrl=f"/api/{settings.api_version}/auth/token"
)


def generate_pkce_pair() -> tuple[str, str]:
    """
    Génère une paire code_verifier / code_challenge pour PKCE
    
    Returns:
        tuple: (code_verifier, code_challenge)
    """
    code_verifier = secrets.token_urlsafe(96)
    
    code_challenge = hashlib.sha256(
        code_verifier.encode('ascii')
    ).hexdigest()
    
    return code_verifier, code_challenge


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crée un JWT access token
    
    Args:
        data: Données à encoder dans le token
        expires_delta: Durée de validité (défaut: 15 min)
        
    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crée un JWT refresh token
    
    Args:
        data: Données à encoder
        
    Returns:
        str: JWT refresh token
    """
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Décode et valide un JWT token
    
    Args:
        token: JWT token
        
    Returns:
        dict: Payload décodé
        
    Raises:
        HTTPException: Si le token est invalide
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as e:
        logger.error(f"❌ Erreur décodage token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Récupère l'utilisateur courant depuis le token JWT
    
    Args:
        token: JWT access token
        
    Returns:
        dict: Données utilisateur
        
    Raises:
        HTTPException: Si l'utilisateur n'est pas authentifié
    """
    payload = decode_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        )
    
    user_data = {
        "id": user_id,
        "email": payload.get("email"),
        "role": payload.get("role", "user"),
        "organization": payload.get("organization"),
    }
    
    return user_data


async def get_current_user_ws(websocket: WebSocket) -> Optional[Dict[str, Any]]:
    """
    Récupère l'utilisateur courant pour une connexion WebSocket
    
    Args:
        websocket: Instance WebSocket
        
    Returns:
        dict: Données utilisateur ou None si non authentifié
    """
    try:
        token = websocket.query_params.get("token")
        
        if not token:
            logger.warning("⚠️ Tentative connexion WS sans token")
            return None
        
        payload = decode_token(token)
        
        user_data = {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "user"),
            "organization": payload.get("organization"),
        }
        
        return user_data
        
    except Exception as e:
        logger.error(f"❌ Erreur auth WebSocket: {e}")
        return None


def check_permission(user_role: str, resource: str, action: str) -> bool:
    """
    Vérifie les permissions RBAC (simplifié, à améliorer avec Casbin)
    
    Args:
        user_role: Rôle de l'utilisateur
        resource: Ressource accédée
        action: Action demandée
        
    Returns:
        bool: True si autorisé
    """
    permissions = {
        "super_admin": {
            "*": ["*"]
        },
        "admin": {
            "reports": ["read", "create", "update", "delete"],
            "users": ["read", "create", "update"],
            "conversations": ["read"],
            "artifacts": ["read", "create"]
        },
        "agent": {
            "reports": ["read", "create", "update"],
            "conversations": ["read", "create"],
            "artifacts": ["read", "create"]
        },
        "user": {
            "reports": ["read:own", "create"],
            "conversations": ["read:own", "create"],
            "artifacts": ["read:own", "create"]
        }
    }
    
    user_perms = permissions.get(user_role, {})
    
    if "*" in user_perms and "*" in user_perms["*"]:
        return True
    
    resource_perms = user_perms.get(resource, [])
    
    return action in resource_perms or "*" in resource_perms

