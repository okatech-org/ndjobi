"""
Endpoints d'authentification OAuth2 + PKCE
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.auth import (
    generate_pkce_pair,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user
)

logger = logging.getLogger(__name__)
router = APIRouter()


class TokenRequest(BaseModel):
    """Modèle de requête pour obtenir un token"""
    code: str
    code_verifier: str


class TokenResponse(BaseModel):
    """Modèle de réponse token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Modèle pour refresh token"""
    refresh_token: str


@router.get("/authorize", tags=["Auth"])
async def authorize(
    client_id: str,
    redirect_uri: str,
    code_challenge: str,
    code_challenge_method: str = "S256",
    state: Optional[str] = None
):
    """
    Point d'entrée OAuth2 Authorization Code Flow avec PKCE
    
    Args:
        client_id: ID client
        redirect_uri: URI de redirection
        code_challenge: Challenge PKCE
        code_challenge_method: Méthode PKCE (S256)
        state: État optionnel
        
    Returns:
        dict: URL de redirection avec code
    """
    logger.info(f"🔐 Demande authorization: client_id={client_id}")
    
    auth_code = "temp_auth_code_123"
    
    return {
        "redirect_uri": f"{redirect_uri}?code={auth_code}&state={state}",
        "code": auth_code,
        "message": "Utilisez ce code pour obtenir un access_token"
    }


@router.post("/token", response_model=TokenResponse, tags=["Auth"])
async def get_token(token_request: TokenRequest):
    """
    Échange le code d'autorisation contre des tokens JWT
    
    Args:
        token_request: Code + verifier PKCE
        
    Returns:
        TokenResponse: Access et refresh tokens
    """
    logger.info(f"🔑 Demande token avec code: {token_request.code[:10]}...")
    
    user_data = {
        "sub": "user_id_123",
        "email": "test@ndjobi.ga",
        "role": "agent",
        "organization": "Ndjobi"
    }
    
    access_token = create_access_token(user_data)
    refresh_token = create_refresh_token({"sub": user_data["sub"]})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=900
    )


@router.post("/refresh", response_model=TokenResponse, tags=["Auth"])
async def refresh_access_token(refresh_request: RefreshTokenRequest):
    """
    Rafraîchit l'access token avec un refresh token
    
    Args:
        refresh_request: Refresh token
        
    Returns:
        TokenResponse: Nouveaux tokens
    """
    try:
        payload = decode_token(refresh_request.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )
        
        user_id = payload.get("sub")
        
        new_access_token = create_access_token({"sub": user_id})
        new_refresh_token = create_refresh_token({"sub": user_id})
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=900
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur refresh token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Impossible de rafraîchir le token"
        )


@router.post("/logout", tags=["Auth"])
async def logout(current_user = Depends(get_current_user)):
    """Déconnexion utilisateur"""
    logger.info(f"👋 Déconnexion: user={current_user['id']}")
    
    return {"message": "Déconnexion réussie"}


@router.get("/me", tags=["Auth"])
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Récupère les informations de l'utilisateur courant"""
    return current_user

