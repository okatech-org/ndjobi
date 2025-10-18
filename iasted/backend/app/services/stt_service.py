"""
Service STT (Speech-to-Text) avec Deepgram
Transcription audio temps réel optimisée pour le français gabonais
"""

import asyncio
import logging
from typing import AsyncGenerator, Optional
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
)

from app.config import settings

logger = logging.getLogger(__name__)


class STTService:
    """Service de transcription audio en texte avec Deepgram"""
    
    def __init__(self):
        """Initialise le client Deepgram"""
        self.api_key = settings.deepgram_api_key
        config = DeepgramClientOptions(
            options={"keepalive": "true"}
        )
        self.client = DeepgramClient(self.api_key, config)
        logger.info("✅ Service STT Deepgram initialisé")
    
    async def transcribe_stream(
        self,
        audio_stream: AsyncGenerator[bytes, None],
        language: str = "fr",
        model: str = "nova-3"
    ) -> AsyncGenerator[dict, None]:
        """
        Transcription en temps réel d'un flux audio
        
        Args:
            audio_stream: Générateur async de chunks audio
            language: Code langue (fr par défaut)
            model: Modèle Deepgram à utiliser
            
        Yields:
            dict: Résultats de transcription avec is_final, transcript, confidence
        """
        try:
            dg_connection = self.client.listen.asyncwebsocket.v("1")
            
            transcript_queue = asyncio.Queue()
            
            async def on_message(self, result, **kwargs):
                """Callback pour les messages de transcription"""
                sentence = result.channel.alternatives[0].transcript
                
                if len(sentence) == 0:
                    return
                
                transcript_data = {
                    "transcript": sentence,
                    "is_final": result.is_final,
                    "confidence": result.channel.alternatives[0].confidence,
                    "words": [
                        {
                            "word": word.word,
                            "start": word.start,
                            "end": word.end,
                            "confidence": word.confidence
                        }
                        for word in result.channel.alternatives[0].words
                    ] if hasattr(result.channel.alternatives[0], 'words') else []
                }
                
                await transcript_queue.put(transcript_data)
            
            async def on_error(self, error, **kwargs):
                """Callback pour les erreurs"""
                logger.error(f"❌ Erreur STT Deepgram: {error}")
                await transcript_queue.put(None)
            
            dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
            dg_connection.on(LiveTranscriptionEvents.Error, on_error)
            
            options = LiveOptions(
                language=language,
                model=model,
                punctuate=True,
                interim_results=True,
                endpointing=300,
                smart_format=True,
                utterance_end_ms="1000",
                vad_events=True,
            )
            
            await dg_connection.start(options)
            
            async def send_audio():
                """Envoie les chunks audio à Deepgram"""
                try:
                    async for audio_chunk in audio_stream:
                        await dg_connection.send(audio_chunk)
                except Exception as e:
                    logger.error(f"❌ Erreur envoi audio: {e}")
                finally:
                    await dg_connection.finish()
            
            audio_task = asyncio.create_task(send_audio())
            
            try:
                while True:
                    transcript_data = await transcript_queue.get()
                    
                    if transcript_data is None:
                        break
                    
                    yield transcript_data
                    
            finally:
                audio_task.cancel()
                try:
                    await audio_task
                except asyncio.CancelledError:
                    pass
                
                await dg_connection.finish()
            
        except Exception as e:
            logger.error(f"❌ Erreur transcription stream: {e}", exc_info=True)
            raise
    
    async def transcribe_file(
        self,
        audio_data: bytes,
        language: str = "fr",
        model: str = "nova-3"
    ) -> dict:
        """
        Transcription d'un fichier audio complet
        
        Args:
            audio_data: Données audio brutes
            language: Code langue
            model: Modèle Deepgram
            
        Returns:
            dict: Résultat de transcription complet
        """
        try:
            payload = {
                "buffer": audio_data,
            }
            
            options = {
                "language": language,
                "model": model,
                "punctuate": True,
                "smart_format": True,
                "paragraphs": True,
                "utterances": True,
                "diarize": True,
            }
            
            response = await self.client.listen.asyncrest.v("1").transcribe_file(
                payload,
                options
            )
            
            transcript = response.results.channels[0].alternatives[0].transcript
            confidence = response.results.channels[0].alternatives[0].confidence
            
            return {
                "success": True,
                "transcript": transcript,
                "confidence": confidence,
                "metadata": {
                    "duration": response.metadata.duration,
                    "channels": response.metadata.channels,
                    "model": response.metadata.model_info.name,
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur transcription fichier: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

