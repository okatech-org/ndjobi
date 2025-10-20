/**
 * 🗣️ iAsted Speech Synthesis Manager
 * Gestion optimisée de Web Speech API pour iOS/Safari
 * Résout les problèmes de voix non chargées et de mode silencieux
 */

export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

export interface SpeechResult {
  success: boolean;
  error?: string;
  duration?: number;
}

export class IAstedSpeechSynthesis {
  private static voicesLoaded = false;
  private static availableVoices: SpeechSynthesisVoice[] = [];
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Initialiser et charger les voix (peut prendre du temps sur iOS)
   */
  static async initialize(): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech Synthesis non supporté par ce navigateur');
    }

    return new Promise((resolve) => {
      // Tenter de récupérer les voix immédiatement
      let voices = speechSynthesis.getVoices();
      
      if (voices && voices.length > 0) {
        this.availableVoices = voices;
        this.voicesLoaded = true;
        console.log(`✅ ${voices.length} voix chargées`);
        resolve();
        return;
      }

      // Sur iOS, les voix ne sont pas disponibles immédiatement
      // On doit attendre l'événement 'voiceschanged'
      const handleVoicesChanged = () => {
        voices = speechSynthesis.getVoices();
        
        if (voices && voices.length > 0) {
          this.availableVoices = voices;
          this.voicesLoaded = true;
          
          console.log(`✅ ${voices.length} voix chargées (via événement)`);
          
          speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }
      };

      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Timeout après 2 secondes si les voix ne se chargent pas
      setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        
        // Dernière tentative
        const finalVoices = speechSynthesis.getVoices();
        if (finalVoices && finalVoices.length > 0) {
          this.availableVoices = finalVoices;
          this.voicesLoaded = true;
          console.log(`✅ ${finalVoices.length} voix chargées (timeout)`);
        } else {
          console.warn('⚠️ Aucune voix disponible après timeout');
        }
        
        resolve();
      }, 2000);
    });
  }

  /**
   * Obtenir la meilleure voix française disponible
   */
  static getBestFrenchVoice(): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded || this.availableVoices.length === 0) {
      return null;
    }

    // Priorité 1: Voix française locale (fr-FR)
    let voice = this.availableVoices.find(v => 
      v.lang?.toLowerCase() === 'fr-fr' && v.localService
    );
    
    if (voice) return voice;

    // Priorité 2: N'importe quelle voix fr-FR
    voice = this.availableVoices.find(v => 
      v.lang?.toLowerCase() === 'fr-fr'
    );
    
    if (voice) return voice;

    // Priorité 3: Voix commençant par 'fr'
    voice = this.availableVoices.find(v => 
      v.lang?.toLowerCase().startsWith('fr')
    );
    
    if (voice) return voice;

    // Priorité 4: Voix contenant 'french' ou 'français' dans le nom
    voice = this.availableVoices.find(v => 
      /french|français|francais/i.test(v.name)
    );

    return voice || null;
  }

  /**
   * Parler un texte avec gestion des textes longs (chunking)
   * iOS a une limite ~200 caractères avant pause
   */
  static async speak(text: string, options: SpeechOptions = {}): Promise<SpeechResult> {
    if (!('speechSynthesis' in window)) {
      return { success: false, error: 'Speech Synthesis non supporté' };
    }

    // Initialiser si pas encore fait
    if (!this.voicesLoaded) {
      await this.initialize();
    }

    // Arrêter toute parole en cours
    this.stop();

    try {
      // Découper le texte en chunks pour iOS (max 200 caractères)
      const chunks = this.splitTextIntoChunks(text, 200);
      
      console.log(`🗣️ Parole de ${chunks.length} segments`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        
        await this.speakChunk(chunk, options, isLast);
        
        // Petite pause entre les chunks (80ms)
        if (!isLast) {
          await this.delay(80);
        }
      }

      return { success: true };

    } catch (error: any) {
      console.error('❌ Erreur Speech Synthesis:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parler un chunk de texte
   */
  private static speakChunk(
    text: string, 
    options: SpeechOptions, 
    isLast: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = options.lang || 'fr-FR';
      utterance.rate = options.rate || 0.95;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Sélectionner la voix
      const voice = options.voice || this.getBestFrenchVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        if (isLast) {
          this.currentUtterance = null;
        }
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Erreur utterance:', event);
        
        // iOS peut déclencher des erreurs "interrupted" lors du chunking
        // On les ignore si ce n'est pas le dernier chunk
        if (event.error === 'interrupted' && !isLast) {
          resolve();
        } else {
          reject(new Error(event.error));
        }
      };

      this.currentUtterance = utterance;
      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Découper le texte en chunks pour éviter les limites iOS
   */
  private static splitTextIntoChunks(text: string, maxLength: number): string[] {
    // Nettoyer le texte
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length <= maxLength) {
      return [cleanText];
    }

    // Découper par phrases
    const sentences = cleanText.split(/(?<=[.!?])\s+/).filter(Boolean);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      // Si une phrase seule est trop longue, la découper par virgules
      if (sentence.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        const parts = sentence.split(/,\s+/);
        for (const part of parts) {
          if ((currentChunk + ' ' + part).trim().length > maxLength) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = part;
          } else {
            currentChunk = (currentChunk + ' ' + part).trim();
          }
        }
        continue;
      }

      // Ajouter la phrase au chunk courant si ça ne dépasse pas
      if ((currentChunk + ' ' + sentence).trim().length <= maxLength) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(Boolean);
  }

  /**
   * Arrêter la parole en cours
   */
  static stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Vérifier si une parole est en cours
   */
  static isSpeaking(): boolean {
    return ('speechSynthesis' in window) && speechSynthesis.speaking;
  }

  /**
   * Obtenir toutes les voix disponibles
   */
  static getVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  /**
   * Délai utilitaire
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Vérifier si Speech Synthesis est supporté
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

