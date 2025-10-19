/**
 * iAsted Voice Service
 * 
 * Gère la reconnaissance vocale (STT) et la synthèse vocale (TTS)
 * pour l'interaction vocale avec l'assistant présidentiel.
 */

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
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Créer le blob audio
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Arrêter le stream
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }

          // Transcrire l'audio avec Whisper API
          const transcription = await this.transcribeAudio(audioBlob);

          console.log('📝 Transcription:', transcription);

          resolve({
            transcription,
            audioBlob,
            audioUrl
          });

        } catch (error: any) {
          console.error('Erreur transcription:', error);
          resolve({
            transcription: '',
            audioBlob: new Blob([]),
            audioUrl: '',
            error: error.message
          });
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcrire un audio avec l'API Whisper d'OpenAI
   */
  private static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr');
      formData.append('response_format', 'text');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const transcription = await response.text();
      return transcription.trim();

    } catch (error: any) {
      console.error('Erreur API Whisper:', error);
      
      // Fallback : Web Speech API (moins précis mais gratuit)
      return this.transcribeWithWebSpeech(audioBlob);
    }
  }

  /**
   * Fallback : Transcription avec Web Speech API
   */
  private static transcribeWithWebSpeech(audioBlob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcription = event.results[0][0].transcript;
        resolve(transcription);
      };

      recognition.onerror = () => {
        resolve('');
      };

      // Jouer l'audio pour la reconnaissance
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
      recognition.start();
    });
  }

  /**
   * PARTIE 2 : SYNTHÈSE VOCALE (Text-to-Speech)
   * 
   * Convertit le texte en audio avec voix naturelle
   */

  /**
   * Convertir du texte en audio et le jouer
   */
  static async speakText(text: string): Promise<{
    success: boolean;
    audioUrl?: string;
    audioBlob?: Blob;
    error?: string;
  }> {
    try {
      // Option 1 : Utiliser Azure TTS (meilleure qualité)
      if (import.meta.env.VITE_AZURE_SPEECH_KEY) {
        return await this.speakWithAzureTTS(text);
      }

      // Option 2 : Utiliser OpenAI TTS
      if (import.meta.env.VITE_OPENAI_API_KEY) {
        return await this.speakWithOpenAITTS(text);
      }

      // Option 3 : Fallback - Web Speech API (gratuit mais qualité moindre)
      return this.speakWithWebSpeech(text);

    } catch (error: any) {
      console.error('Erreur synthèse vocale:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * TTS avec Azure Cognitive Services (Recommandé)
   */
  private static async speakWithAzureTTS(text: string): Promise<any> {
    const apiKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const region = import.meta.env.VITE_AZURE_SPEECH_REGION || 'westeurope';

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">
        <voice name="${this.VOICE_CONFIG.voiceName}">
          <prosody rate="${this.VOICE_CONFIG.rate}" pitch="${this.VOICE_CONFIG.pitch}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      }
    );

    if (!response.ok) {
      throw new Error(`Azure TTS error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Jouer l'audio
    const audio = new Audio(audioUrl);
    await audio.play();

    return { success: true, audioUrl, audioBlob };
  }

  /**
   * TTS avec OpenAI
   */
  private static async speakWithOpenAITTS(text: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova', // Voix féminine professionnelle
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Jouer l'audio
    const audio = new Audio(audioUrl);
    await audio.play();

    return { success: true, audioUrl, audioBlob };
  }

  /**
   * TTS Fallback avec Web Speech API
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

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = this.VOICE_CONFIG.rate;
      utterance.pitch = this.VOICE_CONFIG.pitch;
      utterance.volume = this.VOICE_CONFIG.volume;

      // Sélectionner une voix française
      const voices = speechSynthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onend = () => {
        resolve({ success: true });
      };

      utterance.onerror = (error) => {
        resolve({ 
          success: false, 
          error: error.error 
        });
      };

      speechSynthesis.speak(utterance);
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
