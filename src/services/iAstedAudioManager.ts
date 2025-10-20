/**
 * 🎵 iAsted Audio Manager
 * Gestion audio optimisée pour iOS/Safari et mobile
 * Résout les problèmes d'autoplay et de compatibilité
 */

export interface AudioPlayResult {
  success: boolean;
  error?: string;
  duration?: number;
}

export class IAstedAudioManager {
  private static audioPool: HTMLAudioElement[] = [];
  private static audioContext: AudioContext | null = null;
  private static isUnlocked = false;
  private static currentAudio: HTMLAudioElement | null = null;
  
  /**
   * Initialiser et débloquer l'audio lors d'une interaction utilisateur
   * DOIT être appelé dans un gestionnaire d'événement direct (click, touch, etc.)
   */
  static async initialize(): Promise<void> {
    if (this.isUnlocked) return;
    
    try {
      // 1. Créer et débloquer AudioContext
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      }

      // 2. Créer un pool d'éléments Audio pré-initialisés
      // iOS nécessite que l'élément Audio soit créé lors d'une interaction utilisateur
      for (let i = 0; i < 3; i++) {
        const audio = new Audio();
        audio.preload = 'auto';
        
        // Petite astuce pour débloquer l'audio sur iOS
        audio.src = 'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
        const playPromise = audio.play();
        
        if (playPromise) {
          try {
            await playPromise;
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            console.warn('Audio unlock attempt failed:', e);
          }
        }
        
        this.audioPool.push(audio);
      }

      this.isUnlocked = true;
      console.log('✅ Audio Manager initialisé et débloqué');
      
    } catch (error) {
      console.error('❌ Erreur initialisation Audio Manager:', error);
    }
  }

  /**
   * Détecter les formats audio supportés par le navigateur
   */
  static getSupportedAudioFormat(): { mimeType: string; extension: string } {
    const audio = document.createElement('audio');
    
    // iOS préfère AAC/M4A
    if (audio.canPlayType('audio/mp4; codecs="mp4a.40.2"')) {
      return { mimeType: 'audio/mp4', extension: 'm4a' };
    }
    
    // MP3 largement supporté
    if (audio.canPlayType('audio/mpeg')) {
      return { mimeType: 'audio/mpeg', extension: 'mp3' };
    }
    
    // WebM pour les navigateurs modernes (sauf iOS)
    if (audio.canPlayType('audio/webm; codecs=opus')) {
      return { mimeType: 'audio/webm', extension: 'webm' };
    }
    
    // Fallback WAV
    return { mimeType: 'audio/wav', extension: 'wav' };
  }

  /**
   * Jouer un audio depuis un Blob avec retry et détection d'erreur
   */
  static async playAudioBlob(blob: Blob, maxRetries = 3): Promise<AudioPlayResult> {
    if (!this.isUnlocked) {
      console.warn('⚠️ Audio Manager non initialisé - tentative d\'initialisation');
      await this.initialize();
    }

    // Arrêter l'audio en cours si présent
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
    }

    // Utiliser un élément Audio du pool ou en créer un nouveau
    const audio = this.audioPool.length > 0 
      ? this.audioPool[0] 
      : new Audio();
    
    this.currentAudio = audio;

    const url = URL.createObjectURL(blob);
    audio.src = url;

    return new Promise((resolve) => {
      let retryCount = 0;
      
      const attemptPlay = async () => {
        try {
          const playPromise = audio.play();
          
          if (!playPromise) {
            resolve({ success: false, error: 'Navigateur ne supporte pas les Promises audio' });
            return;
          }

          await playPromise;
          
          // Succès - attendre la fin de la lecture
          audio.onended = () => {
            URL.revokeObjectURL(url);
            this.currentAudio = null;
            resolve({ success: true, duration: audio.duration });
          };

          audio.onerror = (err) => {
            console.error('Erreur lecture audio:', err);
            URL.revokeObjectURL(url);
            this.currentAudio = null;
            resolve({ success: false, error: 'Erreur lecture audio' });
          };

        } catch (error: any) {
          console.error(`Tentative ${retryCount + 1}/${maxRetries} échouée:`, error);
          
          // Retry avec délai exponentiel
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 100; // 200ms, 400ms, 800ms
            
            setTimeout(() => {
              console.log(`🔄 Retry ${retryCount}/${maxRetries} après ${delay}ms`);
              attemptPlay();
            }, delay);
            
          } else {
            URL.revokeObjectURL(url);
            this.currentAudio = null;
            
            resolve({ 
              success: false, 
              error: `Échec lecture audio après ${maxRetries} tentatives: ${error.message}` 
            });
          }
        }
      };

      attemptPlay();
    });
  }

  /**
   * Jouer un audio depuis une URL
   */
  static async playAudioUrl(url: string): Promise<AudioPlayResult> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return this.playAudioBlob(blob);
    } catch (error: any) {
      return { 
        success: false, 
        error: `Échec téléchargement audio: ${error.message}` 
      };
    }
  }

  /**
   * Arrêter la lecture audio en cours
   */
  static stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
  }

  /**
   * Vérifier si l'audio est débloqué
   */
  static isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Obtenir l'AudioContext (pour Web Audio API)
   */
  static getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Nettoyer les ressources
   */
  static cleanup(): void {
    this.stop();
    
    this.audioPool.forEach(audio => {
      audio.src = '';
      audio.load();
    });
    
    this.audioPool = [];
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isUnlocked = false;
  }
}

