interface WhisperResponse {
  text: string;
  language?: string;
  duration?: number;
}

interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
}

class WhisperService {
  private apiKey: string | null = null;
  private apiEndpoint = 'https://api.openai.com/v1/audio/transcriptions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async transcribeAudio(
    audioBlob: Blob,
    options: TranscriptionOptions = {}
  ): Promise<WhisperResponse> {
    if (!this.isConfigured()) {
      console.warn('Whisper API not configured. Using mock transcription.');
      return this.mockTranscription(audioBlob);
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      if (options.language) {
        formData.append('language', options.language);
      }
      
      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }
      
      if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString());
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        text: data.text,
        language: data.language,
        duration: data.duration,
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      return this.mockTranscription(audioBlob);
    }
  }

  private async mockTranscription(audioBlob: Blob): Promise<WhisperResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockTexts = [
      "Je souhaite signaler un cas de corruption au niveau du ministère. Les faits se sont déroulés le mois dernier et impliquent plusieurs fonctionnaires.",
      "Mon projet innovant concerne le développement d'une application mobile pour faciliter l'accès aux services publics au Gabon.",
      "Il s'agit d'un détournement de fonds publics estimé à plusieurs millions de francs CFA. Les preuves sont accablantes.",
      "Cette innovation technologique permettra de réduire la corruption grâce à la transparence et la traçabilité des transactions.",
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

    return {
      text: randomText,
      language: 'fr',
      duration: Math.round((audioBlob.size / 16000) * 100) / 100,
    };
  }

  async transcribeFile(file: File, options: TranscriptionOptions = {}): Promise<WhisperResponse> {
    return this.transcribeAudio(file, options);
  }

  formatTranscription(text: string): string {
    let formatted = text.trim();
    
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
      formatted += '.';
    }
    
    return formatted;
  }

  async batchTranscribe(audioBlobs: Blob[], options: TranscriptionOptions = {}): Promise<WhisperResponse[]> {
    const results: WhisperResponse[] = [];
    
    for (const blob of audioBlobs) {
      try {
        const result = await this.transcribeAudio(blob, options);
        results.push(result);
      } catch (error) {
        console.error('Batch transcription error:', error);
        results.push({ text: '[Erreur de transcription]' });
      }
    }
    
    return results;
  }

  combineTranscriptions(transcriptions: WhisperResponse[]): string {
    return transcriptions
      .map(t => this.formatTranscription(t.text))
      .join(' ');
  }

  estimateCost(durationInSeconds: number): number {
    const pricePerMinute = 0.006;
    return (durationInSeconds / 60) * pricePerMinute;
  }
}

export const whisperService = new WhisperService();

