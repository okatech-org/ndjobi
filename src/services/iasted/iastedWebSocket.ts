/**
 * Service WebSocket pour conversations vocales temps réel avec iAsted
 * Gère la connexion, l'envoi/réception audio, et les événements
 */

export interface TranscriptMessage {
  type: 'transcript';
  transcript: string;
  is_final: boolean;
  confidence: number;
}

export interface LLMResponseMessage {
  type: 'llm_response';
  text: string;
  provider: 'gemini-flash' | 'gpt-4o-mini' | 'claude-haiku';
  tokens: number;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
}

export type IAstedMessage = TranscriptMessage | LLMResponseMessage | ErrorMessage | { type: 'pong' };

export interface IAstedWebSocketConfig {
  sessionId: string;
  token: string;
  wsUrl?: string;
  onTranscript?: (message: TranscriptMessage) => void;
  onLLMResponse?: (message: LLMResponseMessage) => void;
  onAudioResponse?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class IAstedWebSocket {
  private ws: WebSocket | null = null;
  private config: IAstedWebSocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(config: IAstedWebSocketConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.wsUrl || 'ws://localhost:8000/api/v1';
      const url = `${wsUrl}/voice/ws/${this.config.sessionId}?token=${this.config.token}`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket iAsted connecté');
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.config.onConnect?.();
        resolve();
      };

      this.ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          this.config.onAudioResponse?.(event.data);
        } else {
          try {
            const message: IAstedMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Erreur parsing message WebSocket:', error);
          }
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        this.config.onError?.('Erreur de connexion WebSocket');
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket fermé');
        this.stopPingInterval();
        this.config.onDisconnect?.();
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };
    });
  }

  private handleMessage(message: IAstedMessage) {
    switch (message.type) {
      case 'transcript':
        this.config.onTranscript?.(message);
        break;
      case 'llm_response':
        this.config.onLLMResponse?.(message);
        break;
      case 'error':
        this.config.onError?.(message.error);
        break;
      case 'pong':
        break;
    }
  }

  sendAudioChunk(audioData: ArrayBuffer) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    } else {
      console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer audio');
    }
  }

  endUtterance() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'end_utterance' }));
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default IAstedWebSocket;

