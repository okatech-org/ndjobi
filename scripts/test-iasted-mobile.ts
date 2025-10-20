/**
 * 🧪 SCRIPT DE TEST IASTED MOBILE/iOS
 * 
 * Ce script permet de tester les corrections audio d'iAsted sur mobile
 * 
 * COMMENT TESTER:
 * 1. Déployer l'application sur un environnement accessible depuis mobile
 * 2. Ouvrir l'app sur iOS Safari ou Chrome Android
 * 3. Activer la console développeur (Safari: Réglages > Safari > Avancé > Inspecteur Web)
 * 4. Exécuter ce script dans la console
 */

export interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

export class IAstedMobileTestSuite {
  private results: TestResult[] = [];

  /**
   * Exécuter tous les tests
   */
  async runAll(): Promise<TestResult[]> {
    console.log('🧪 === DÉBUT DES TESTS IASTED MOBILE/iOS ===\n');
    
    await this.testBrowserInfo();
    await this.testAudioElementSupport();
    await this.testAudioContextSupport();
    await this.testSpeechSynthesisSupport();
    await this.testMediaRecorderSupport();
    await this.testAudioFormatsSupport();
    await this.testAutoplayPolicy();
    await this.testMicrophoneAccess();
    
    console.log('\n🧪 === FIN DES TESTS ===\n');
    this.printSummary();
    
    return this.results;
  }

  /**
   * Test 1: Informations navigateur
   */
  private async testBrowserInfo(): Promise<void> {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
      isChrome: /Chrome/.test(navigator.userAgent),
    };

    this.addResult({
      name: 'Browser Info',
      success: true,
      message: `Platform: ${info.platform}, iOS: ${info.isIOS}, Safari: ${info.isSafari}`,
      details: info
    });
  }

  /**
   * Test 2: Support HTMLAudioElement
   */
  private async testAudioElementSupport(): Promise<void> {
    try {
      const audio = new Audio();
      const canPlayMP3 = audio.canPlayType('audio/mpeg') !== '';
      const canPlayM4A = audio.canPlayType('audio/mp4') !== '';
      const canPlayWebM = audio.canPlayType('audio/webm') !== '';

      this.addResult({
        name: 'HTMLAudioElement Support',
        success: true,
        message: `MP3: ${canPlayMP3}, M4A: ${canPlayM4A}, WebM: ${canPlayWebM}`,
        details: { canPlayMP3, canPlayM4A, canPlayWebM }
      });
    } catch (error: any) {
      this.addResult({
        name: 'HTMLAudioElement Support',
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test 3: Support AudioContext
   */
  private async testAudioContextSupport(): Promise<void> {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioCtx) {
        throw new Error('AudioContext non supporté');
      }

      const ctx = new AudioCtx();
      const state = ctx.state;
      
      this.addResult({
        name: 'AudioContext Support',
        success: true,
        message: `État initial: ${state}`,
        details: { state, sampleRate: ctx.sampleRate }
      });

      // Tenter de reprendre si suspendu
      if (state === 'suspended') {
        await ctx.resume();
        this.addResult({
          name: 'AudioContext Resume',
          success: ctx.state === 'running',
          message: `État après resume(): ${ctx.state}`
        });
      }

      ctx.close();
    } catch (error: any) {
      this.addResult({
        name: 'AudioContext Support',
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test 4: Support Speech Synthesis
   */
  private async testSpeechSynthesisSupport(): Promise<void> {
    try {
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech Synthesis non supporté');
      }

      const voices = speechSynthesis.getVoices();
      const frenchVoices = voices.filter(v => v.lang?.toLowerCase().startsWith('fr'));

      this.addResult({
        name: 'Speech Synthesis Support',
        success: true,
        message: `${voices.length} voix disponibles, ${frenchVoices.length} françaises`,
        details: { totalVoices: voices.length, frenchVoices: frenchVoices.length }
      });
    } catch (error: any) {
      this.addResult({
        name: 'Speech Synthesis Support',
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test 5: Support MediaRecorder
   */
  private async testMediaRecorderSupport(): Promise<void> {
    try {
      if (!('MediaRecorder' in window)) {
        throw new Error('MediaRecorder non supporté');
      }

      const formats = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/wav'
      ];

      const supported = formats.filter(fmt => MediaRecorder.isTypeSupported(fmt));

      this.addResult({
        name: 'MediaRecorder Support',
        success: supported.length > 0,
        message: `Formats supportés: ${supported.join(', ') || 'aucun'}`,
        details: { supported }
      });
    } catch (error: any) {
      this.addResult({
        name: 'MediaRecorder Support',
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test 6: Formats audio supportés
   */
  private async testAudioFormatsSupport(): Promise<void> {
    const audio = document.createElement('audio');
    const formats = [
      { mime: 'audio/mpeg', label: 'MP3' },
      { mime: 'audio/mp4', label: 'MP4/M4A' },
      { mime: 'audio/mp4; codecs="mp4a.40.2"', label: 'AAC' },
      { mime: 'audio/webm', label: 'WebM' },
      { mime: 'audio/webm; codecs=opus', label: 'WebM Opus' },
      { mime: 'audio/ogg; codecs=vorbis', label: 'OGG' },
      { mime: 'audio/wav', label: 'WAV' }
    ];

    const supportedFormats = formats
      .filter(fmt => audio.canPlayType(fmt.mime) !== '')
      .map(fmt => fmt.label);

    this.addResult({
      name: 'Audio Formats Support',
      success: supportedFormats.length > 0,
      message: `Formats supportés: ${supportedFormats.join(', ')}`,
      details: { supportedFormats }
    });
  }

  /**
   * Test 7: Politique Autoplay
   */
  private async testAutoplayPolicy(): Promise<void> {
    try {
      // Créer un petit son silencieux
      const silentAudio = new Audio(
        'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='
      );

      const playPromise = silentAudio.play();
      
      if (playPromise) {
        await playPromise;
        silentAudio.pause();
        
        this.addResult({
          name: 'Autoplay Policy',
          success: true,
          message: 'Autoplay autorisé (ou audio débloqué)'
        });
      } else {
        this.addResult({
          name: 'Autoplay Policy',
          success: false,
          message: 'Navigateur ne supporte pas les Promises audio'
        });
      }
    } catch (error: any) {
      this.addResult({
        name: 'Autoplay Policy',
        success: false,
        message: `Autoplay bloqué: ${error.name}`,
        details: { error: error.name, message: error.message }
      });
    }
  }

  /**
   * Test 8: Accès microphone
   */
  private async testMicrophoneAccess(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      this.addResult({
        name: 'Microphone Access',
        success: true,
        message: 'Accès microphone autorisé'
      });
    } catch (error: any) {
      this.addResult({
        name: 'Microphone Access',
        success: false,
        message: `Accès refusé: ${error.name}`
      });
    }
  }

  /**
   * Ajouter un résultat de test
   */
  private addResult(result: TestResult): void {
    this.results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    
    if (result.details) {
      console.log('   Détails:', result.details);
    }
  }

  /**
   * Afficher le résumé
   */
  private printSummary(): void {
    const total = this.results.length;
    const success = this.results.filter(r => r.success).length;
    const failed = total - success;

    console.log('\n📊 RÉSUMÉ:');
    console.log(`   Total: ${total}`);
    console.log(`   ✅ Réussis: ${success}`);
    console.log(`   ❌ Échecs: ${failed}`);
    console.log(`   Taux de réussite: ${Math.round((success / total) * 100)}%`);
  }

  /**
   * Obtenir les résultats
   */
  getResults(): TestResult[] {
    return this.results;
  }
}

// Export d'une instance pour utilisation globale
export const iastedMobileTest = new IAstedMobileTestSuite();

// Si exécuté dans la console, lancer automatiquement
if (typeof window !== 'undefined') {
  (window as any).iastedMobileTest = iastedMobileTest;
  console.log('🧪 Suite de tests iAsted Mobile chargée');
  console.log('📝 Exécuter: iastedMobileTest.runAll()');
}

