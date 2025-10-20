/**
 * iAsted Voice Service - VERSION iOS/MOBILE OPTIMISÉE
 * 
 * Gère la reconnaissance vocale (STT) et la synthèse vocale (TTS)
 * pour l'interaction vocale avec l'assistant présidentiel.
 * 
 * OPTIMISATIONS iOS/MOBILE:
 * - AudioPool pré-initialisé pour contourner l'autoplay
 * - Détection format audio supporté (MP3/AAC/M4A)
 * - MediaRecorder avec fallback WebM/MP4
 * - Web Speech API avec gestion voix iOS
 * - Retry automatique avec délais exponentiels
 */

import { supabase } from '@/integrations/supabase/client';
import { IAstedAudioManager } from './iAstedAudioManager';
import { IAstedSpeechSynthesis } from './iAstedSpeechSynthesis';

export class IAstedVoiceService {
  
  // Configuration vocale
  private static readonly VOICE_CONFIG = {
    language: 'fr-FR', // Français
    voiceName: 'fr-FR-DeniseNeural', // Voix féminine professionnelle Azure
    // Alternative : 'fr-FR-HenriNeural' pour voix masculine
    rate: 1.0, // Vitesse normale
    pitch: 1.0, // Tonalité normale
    volume: 1.0 // Volume maximal
  };

  private static mediaRecorder: MediaRecorder | null = null;
  private static audioChunks: Blob[] = [];
  private static stream: MediaStream | null = null;

  // Expose current mic stream for UI-level audio analysis (read-only)
  static getCurrentStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Initialiser le système audio (DOIT être appelé lors d'une interaction utilisateur)
   */
  static async initializeAudio(): Promise<void> {
    await IAstedAudioManager.initialize();
    await IAstedSpeechSynthesis.initialize();
    console.log('✅ iAsted Voice Service initialisé');
  }

  /**
   * PARTIE 1 : RECONNAISSANCE VOCALE (Speech-to-Text)
   * 
   * Utilise l'API Web Speech Recognition ou l'API Whisper d'OpenAI
   */

  /**
   * Détecter le format MediaRecorder supporté
   */
  private static getSupportedMediaRecorderFormat(): { mimeType: string; extension: string } {
    // iOS supporte audio/mp4
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return { mimeType: 'audio/mp4', extension: 'mp4' };
    }
    
    // Android et navigateurs modernes supportent webm
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      return { mimeType: 'audio/webm;codecs=opus', extension: 'webm' };
    }
    
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      return { mimeType: 'audio/webm', extension: 'webm' };
    }
    
    // Fallback
    return { mimeType: '', extension: 'webm' };
  }

  /**
   * Démarrer l'enregistrement audio avec détection de format
   */
  static async startRecording(): Promise<{ success: boolean; error?: string }> {
    try {
      // Demander la permission d'accès au microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Détecter le format supporté
      const format = this.getSupportedMediaRecorderFormat();
      console.log('📱 Format MediaRecorder détecté:', format.mimeType || 'default');

      // Créer le MediaRecorder avec le bon format
      this.mediaRecorder = format.mimeType 
        ? new MediaRecorder(this.stream, { mimeType: format.mimeType })
        : new MediaRecorder(this.stream);

      this.audioChunks = [];

      // Collecter les chunks audio
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Démarrer l'enregistrement
      this.mediaRecorder.start();

      console.log('🎙️ Enregistrement démarré...');
      return { success: true };

    } catch (error: any) {
      console.error('Erreur démarrage enregistrement:', error);
      return { 
        success: false, 
        error: error.message || 'Impossible d\'accéder au microphone' 
      };
    }
  }

  /**
   * Arrêter l'enregistrement et obtenir la transcription
   */
  static async stopRecordingAndTranscribe(): Promise<{
    transcription: string;
    audioBlob: Blob;
    audioUrl: string;
    error?: string;
  } | null> {
    
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        console.error('❌ MediaRecorder non initialisé');
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          console.log('🎵 Création du blob audio...');
          
          // Créer le blob audio
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          console.log(`📦 Blob créé: ${audioBlob.size} bytes`);

          // Arrêter le stream
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }

          if (audioBlob.size < 1000) {
            console.warn('⚠️ Audio trop court, probablement vide');
            resolve({
              transcription: '',
              audioBlob,
              audioUrl,
              error: 'Audio trop court'
            });
            return;
          }

          // Transcrire l'audio avec Deepgram API
          console.log('🔄 Envoi à Deepgram pour transcription...');
          const transcription = await this.transcribeAudio(audioBlob);

          console.log('✅ Transcription reçue:', transcription);

          resolve({
            transcription,
            audioBlob,
            audioUrl
          });

        } catch (error: any) {
          console.error('❌ Erreur transcription:', error);
          resolve({
            transcription: '',
            audioBlob: new Blob([]),
            audioUrl: '',
            error: error.message
          });
        }
      };

      console.log('🛑 Arrêt du MediaRecorder...');
      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcrire un audio avec Deepgram via edge function
   */
  private static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      // Call Deepgram via edge function
      const { data, error } = await supabase.functions.invoke('iasted-stt', {
        body: { audio: base64Audio }
      });

      if (error) throw error;
      if (!data?.text) throw new Error('No transcription returned');

      return data.text;

    } catch (error: any) {
      console.error('Erreur Deepgram:', error);
      
      // Fallback : Web Speech API (moins précis mais gratuit)
      return this.transcribeWithWebSpeech(audioBlob);
    }
  }

  /**
   * Fallback : Transcription avec Web Speech API
   */
  private static transcribeWithWebSpeech(audioBlob: Blob): Promise<string> {
    // Désactivé pour éviter la lecture de l'audio utilisateur en fallback
    return Promise.resolve('');
  }

  /**
   * PARTIE 2 : SYNTHÈSE VOCALE (Text-to-Speech)
   * 
   * Convertit le texte en audio avec voix naturelle
   */

  /**
   * Convertir du texte en audio et le jouer avec ElevenLabs via edge function
   * VERSION iOS OPTIMISÉE avec AudioManager
   */
  static async speakText(text: string): Promise<{
    success: boolean;
    audioUrl?: string;
    audioBlob?: Blob;
    error?: string;
  }> {
    try {
      // Vérifier que l'audio est débloqué
      if (!IAstedAudioManager.isAudioUnlocked()) {
        console.warn('⚠️ Audio non débloqué - tentative fallback Web Speech');
        return this.speakWithWebSpeech(text);
      }

      console.log('🎙️ Appel ElevenLabs TTS...');

      // Call ElevenLabs via edge function
      const { data, error } = await supabase.functions.invoke('iasted-tts', {
        body: { text, voice: 'XB0fDUnXU5powFXDhCwa' } // Charlotte (FR) par défaut
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio returned');

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('🎵 Lecture audio via AudioManager...');

      // Utiliser AudioManager pour la lecture (supporte iOS)
      const playResult = await IAstedAudioManager.playAudioBlob(audioBlob);

      if (playResult.success) {
        console.log('✅ Audio joué avec succès');
        return { success: true, audioUrl, audioBlob };
      } else {
        console.warn('⚠️ Échec AudioManager, fallback Web Speech');
        throw new Error(playResult.error || 'Audio playback failed');
      }

    } catch (error: any) {
      console.error('Erreur ElevenLabs/AudioManager:', error);
      
      // Fallback : Web Speech API (optimisé pour iOS)
      return this.speakWithWebSpeech(text);
    }
  }

  /**
   * TTS Fallback avec Web Speech API optimisé pour iOS
   */
  private static async speakWithWebSpeech(text: string): Promise<any> {
    if (!IAstedSpeechSynthesis.isSupported()) {
      return { 
        success: false, 
        error: 'Speech Synthesis non supporté' 
      };
    }

    try {
      console.log('🗣️ Fallback Web Speech API (iOS optimisé)');
      
      const result = await IAstedSpeechSynthesis.speak(text, {
        lang: this.VOICE_CONFIG.language,
        rate: this.VOICE_CONFIG.rate,
        pitch: this.VOICE_CONFIG.pitch,
        volume: this.VOICE_CONFIG.volume
      });

      return result;
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Speech synthesis error' 
      };
    }
  }

  /**
   * Arrêter la lecture audio en cours
   */
  static stopSpeaking(): void {
    IAstedAudioManager.stop();
    IAstedSpeechSynthesis.stop();
  }

  /**
   * Vérifier si le micro est disponible
   */
  static async checkMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }
}
