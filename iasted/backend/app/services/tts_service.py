"""
Service TTS (Text-to-Speech) avec Google Cloud TTS
Synthèse vocale française naturelle optimisée
"""

import logging
from typing import Optional
from google.cloud import texttospeech
from elevenlabs import ElevenLabs

from app.config import settings

logger = logging.getLogger(__name__)


class TTSService:
    """Service de synthèse vocale texte vers audio"""
    
    def __init__(self):
        """Initialise le client TTS (Google ou ElevenLabs)"""
        self.provider = "google"
        
        if settings.google_application_credentials:
            try:
                self.google_client = texttospeech.TextToSpeechClient()
                self.google_voice = texttospeech.VoiceSelectionParams(
                    language_code=settings.google_tts_language,
                    name=settings.google_tts_voice,
                    ssml_gender=texttospeech.SsmlVoiceGender.MALE
                )
                self.audio_config = texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.MP3,
                    speaking_rate=1.0,
                    pitch=0.0,
                    effects_profile_id=["small-bluetooth-speaker-class-device"]
                )
                logger.info("✅ Service TTS Google Cloud initialisé")
            except Exception as e:
                logger.error(f"❌ Erreur init Google TTS: {e}")
                self.google_client = None
        
        if settings.elevenlabs_api_key and not self.google_client:
            try:
                self.elevenlabs_client = ElevenLabs(api_key=settings.elevenlabs_api_key)
                self.provider = "elevenlabs"
                logger.info("✅ Service TTS ElevenLabs initialisé (fallback)")
            except Exception as e:
                logger.error(f"❌ Erreur init ElevenLabs: {e}")
                self.elevenlabs_client = None
    
    async def synthesize(
        self,
        text: str,
        voice_name: Optional[str] = None,
        speaking_rate: float = 1.0,
        pitch: float = 0.0
    ) -> bytes:
        """
        Convertit du texte en audio
        
        Args:
            text: Texte à synthétiser
            voice_name: Nom de la voix (optionnel)
            speaking_rate: Vitesse de parole (0.25-4.0)
            pitch: Tonalité (-20.0 à 20.0)
            
        Returns:
            bytes: Données audio MP3
        """
        if self.provider == "google" and self.google_client:
            return await self._synthesize_google(text, speaking_rate, pitch)
        elif self.provider == "elevenlabs" and hasattr(self, 'elevenlabs_client'):
            return await self._synthesize_elevenlabs(text, voice_name)
        else:
            raise RuntimeError("Aucun service TTS disponible")
    
    async def _synthesize_google(
        self,
        text: str,
        speaking_rate: float = 1.0,
        pitch: float = 0.0
    ) -> bytes:
        """Synthèse avec Google Cloud TTS"""
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate,
                pitch=pitch,
                effects_profile_id=["small-bluetooth-speaker-class-device"]
            )
            
            response = self.google_client.synthesize_speech(
                input=synthesis_input,
                voice=self.google_voice,
                audio_config=audio_config
            )
            
            logger.debug(f"✅ Synthèse Google réussie: {len(text)} chars -> {len(response.audio_content)} bytes")
            return response.audio_content
            
        except Exception as e:
            logger.error(f"❌ Erreur synthèse Google: {e}", exc_info=True)
            raise
    
    async def _synthesize_elevenlabs(
        self,
        text: str,
        voice_id: Optional[str] = None
    ) -> bytes:
        """Synthèse avec ElevenLabs"""
        try:
            voice_id = voice_id or settings.elevenlabs_voice_id
            
            audio = self.elevenlabs_client.generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            
            audio_bytes = b"".join(audio)
            logger.debug(f"✅ Synthèse ElevenLabs réussie: {len(text)} chars")
            return audio_bytes
            
        except Exception as e:
            logger.error(f"❌ Erreur synthèse ElevenLabs: {e}", exc_info=True)
            raise
    
    async def synthesize_ssml(self, ssml: str) -> bytes:
        """
        Synthèse avec SSML (Speech Synthesis Markup Language)
        
        Args:
            ssml: Texte SSML formaté
            
        Returns:
            bytes: Audio MP3
        """
        if self.provider != "google":
            raise NotImplementedError("SSML uniquement supporté avec Google TTS")
        
        try:
            synthesis_input = texttospeech.SynthesisInput(ssml=ssml)
            
            response = self.google_client.synthesize_speech(
                input=synthesis_input,
                voice=self.google_voice,
                audio_config=self.audio_config
            )
            
            return response.audio_content
            
        except Exception as e:
            logger.error(f"❌ Erreur synthèse SSML: {e}", exc_info=True)
            raise

