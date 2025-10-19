/**
 * iAsted Voice Service
 * 
 * Gère la reconnaissance vocale (STT) et la synthèse vocale (TTS)
 * pour l'interaction vocale avec l'assistant présidentiel.
 */

import { supabase } from '@/integrations/supabase/client';

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
   * PARTIE 1 : RECONNAISSANCE VOCALE (Speech-to-Text)
   * 
   * Utilise l'API Web Speech Recognition ou l'API Whisper d'OpenAI
   */

  /**
   * Démarrer l'enregistrement audio
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

      // Créer le MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

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
   */
  static async speakText(text: string): Promise<{
    success: boolean;
    audioUrl?: string;
    audioBlob?: Blob;
    error?: string;
  }> {
    try {
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

      // Jouer l'audio
      const audio = new Audio(audioUrl);
      await audio.play();

      return { success: true, audioUrl, audioBlob };

    } catch (error: any) {
      console.error('Erreur ElevenLabs:', error);
      
      // Fallback : Web Speech API
      return this.speakWithWebSpeech(text);
    }
  }

  /**
   * TTS Fallback avec Web Speech API (avec attente des voix)
   */
  private static speakWithWebSpeech(text: string): Promise<any> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve({ 
          success: false, 
          error: 'Speech Synthesis non supporté' 
        });
        return;
      }

      const ensureVoices = (): Promise<SpeechSynthesisVoice[]> => {
        return new Promise((res) => {
          let voices = speechSynthesis.getVoices();
          if (voices && voices.length > 0) return res(voices);
          const onVoices = () => {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              speechSynthesis.removeEventListener('voiceschanged', onVoices);
              res(voices);
            }
          };
          speechSynthesis.addEventListener('voiceschanged', onVoices);
          // Timeout fallback
          setTimeout(() => {
            speechSynthesis.removeEventListener('voiceschanged', onVoices);
            res(speechSynthesis.getVoices());
          }, 1000);
        });
      };

      ensureVoices().then((voices) => {
        try {
          // Cancel any ongoing speech to avoid queueing
          speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'fr-FR';
          utterance.rate = this.VOICE_CONFIG.rate;
          utterance.pitch = this.VOICE_CONFIG.pitch;
          utterance.volume = this.VOICE_CONFIG.volume;

          // Sélectionner une voix française si disponible
          const frenchVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('fr'))
            || voices.find(v => /fr|french/i.test(v.name));
          if (frenchVoice) utterance.voice = frenchVoice;

          utterance.onend = () => resolve({ success: true });
          utterance.onerror = (error) => resolve({ success: false, error: (error as any).error || 'speech error' });

          speechSynthesis.speak(utterance);
        } catch (e: any) {
          resolve({ success: false, error: e?.message || 'tts error' });
        }
      });
    });
  }

  /**
   * Arrêter la lecture audio en cours
   */
  static stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
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
