"""
Endpoints WebSocket pour conversations vocales temps réel
Pipeline complet : Audio → STT → LLM → TTS → Audio
"""

import logging
import uuid
import json
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.responses import JSONResponse
import asyncio

from app.services.stt_service import STTService
from app.services.tts_service import TTSService
from app.services.llm_router import LLMRouter
from app.core.redis_client import get_redis_client
from app.core.auth import get_current_user_ws

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    """Gestionnaire de connexions WebSocket"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, set] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str, user_id: str):
        """Accepte une nouvelle connexion WebSocket"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = set()
        self.user_sessions[user_id].add(session_id)
        
        logger.info(f"✅ WebSocket connecté: session={session_id}, user={user_id}")
    
    def disconnect(self, session_id: str, user_id: str):
        """Déconnecte une session WebSocket"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        
        if user_id in self.user_sessions:
            self.user_sessions[user_id].discard(session_id)
            if not self.user_sessions[user_id]:
                del self.user_sessions[user_id]
        
        logger.info(f"🔌 WebSocket déconnecté: session={session_id}")
    
    async def send_json(self, session_id: str, data: dict):
        """Envoie des données JSON"""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(data)
    
    async def send_bytes(self, session_id: str, data: bytes):
        """Envoie des données binaires"""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_bytes(data)


manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def voice_websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
):
    """
    Endpoint WebSocket principal pour conversations vocales temps réel
    
    Flow:
    1. Client envoie audio chunks
    2. STT transcrit en texte
    3. LLM génère réponse
    4. TTS synthétise en audio
    5. Audio renvoyé au client
    """
    user = await get_current_user_ws(websocket)
    
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    await manager.connect(websocket, session_id, user["id"])
    
    stt_service = STTService()
    tts_service = TTSService()
    llm_router = LLMRouter()
    redis = get_redis_client()
    
    try:
        context_key = f"session:{session_id}"
        context = await redis.get(context_key)
        
        if context:
            context = json.loads(context)
        else:
            context = {
                "user_id": user["id"],
                "user_role": user.get("role", "user"),
                "session_id": session_id,
                "last_turns": [],
                "created_at": str(uuid.uuid4())
            }
        
        await manager.send_json(session_id, {
            "type": "connected",
            "session_id": session_id,
            "message": "Connexion établie. Commencez à parler."
        })
        
        while True:
            data = await websocket.receive()
            
            if "bytes" in data:
                await handle_audio_chunk(
                    data["bytes"],
                    session_id,
                    context,
                    stt_service,
                    llm_router,
                    tts_service,
                    redis
                )
            
            elif "text" in data:
                message = json.loads(data["text"])
                
                if message.get("type") == "ping":
                    await manager.send_json(session_id, {"type": "pong"})
                
                elif message.get("type") == "end_utterance":
                    logger.debug(f"🗣️ Fin d'utterance détectée: {session_id}")
            
    except WebSocketDisconnect:
        logger.info(f"Client déconnecté: {session_id}")
    except Exception as e:
        logger.error(f"❌ Erreur WebSocket: {e}", exc_info=True)
        await manager.send_json(session_id, {
            "type": "error",
            "error": "Une erreur est survenue"
        })
    finally:
        manager.disconnect(session_id, user["id"])


async def handle_audio_chunk(
    audio_data: bytes,
    session_id: str,
    context: Dict[str, Any],
    stt_service: STTService,
    llm_router: LLMRouter,
    tts_service: TTSService,
    redis: Any
):
    """
    Traite un chunk audio : STT → LLM → TTS
    
    Args:
        audio_data: Données audio brutes
        session_id: ID de session
        context: Contexte de conversation
        stt_service: Service STT
        llm_router: Router LLM
        tts_service: Service TTS
        redis: Client Redis
    """
    try:
        async def audio_stream():
            yield audio_data
        
        transcript = ""
        
        async for result in stt_service.transcribe_stream(audio_stream()):
            if result["is_final"]:
                transcript = result["transcript"]
                confidence = result["confidence"]
                
                logger.info(f"🎤 Transcription finale: {transcript} (conf={confidence:.2f})")
                
                await manager.send_json(session_id, {
                    "type": "transcript",
                    "transcript": transcript,
                    "is_final": True,
                    "confidence": confidence
                })
                
                response, provider, metadata = await llm_router.route_and_generate(
                    transcript,
                    context
                )
                
                logger.info(f"🤖 Réponse LLM ({provider.value}): {response[:100]}...")
                
                await manager.send_json(session_id, {
                    "type": "llm_response",
                    "text": response,
                    "provider": provider.value,
                    "tokens": metadata.get("tokens", 0)
                })
                
                audio_response = await tts_service.synthesize(response)
                
                logger.info(f"🔊 Audio synthétisé: {len(audio_response)} bytes")
                
                await manager.send_bytes(session_id, audio_response)
                
                context["last_turns"].append({
                    "user": transcript,
                    "assistant": response,
                    "provider": provider.value,
                    "timestamp": str(uuid.uuid4())
                })
                
                if len(context["last_turns"]) > 10:
                    context["last_turns"] = context["last_turns"][-10:]
                
                await redis.setex(
                    f"session:{session_id}",
                    1800,
                    json.dumps(context)
                )
                
                break
            else:
                await manager.send_json(session_id, {
                    "type": "transcript",
                    "transcript": result["transcript"],
                    "is_final": False,
                    "confidence": result["confidence"]
                })
        
    except Exception as e:
        logger.error(f"❌ Erreur traitement audio: {e}", exc_info=True)
        await manager.send_json(session_id, {
            "type": "error",
            "error": "Erreur de traitement audio"
        })


@router.post("/sessions", tags=["Voice"])
async def create_voice_session(user = Depends(get_current_user_ws)):
    """
    Crée une nouvelle session vocale
    
    Returns:
        dict: ID de session et WebSocket URL
    """
    session_id = str(uuid.uuid4())
    
    redis = get_redis_client()
    context = {
        "user_id": user["id"],
        "user_role": user.get("role", "user"),
        "session_id": session_id,
        "last_turns": [],
        "created_at": str(uuid.uuid4())
    }
    
    await redis.setex(
        f"session:{session_id}",
        1800,
        json.dumps(context)
    )
    
    return JSONResponse({
        "session_id": session_id,
        "ws_url": f"/api/v1/voice/ws/{session_id}",
        "expires_in": 1800
    })


@router.delete("/sessions/{session_id}", tags=["Voice"])
async def end_voice_session(
    session_id: str,
    user = Depends(get_current_user_ws)
):
    """Termine une session vocale"""
    redis = get_redis_client()
    
    await redis.delete(f"session:{session_id}")
    
    manager.disconnect(session_id, user["id"])
    
    return JSONResponse({
        "message": "Session terminée",
        "session_id": session_id
    })

