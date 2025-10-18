/**
 * Client API iAsted pour communication avec le backend FastAPI
 * Gère l'authentification, les requêtes REST et WebSocket
 */

import axios, { AxiosInstance } from 'axios';

const IASTED_API_URL = import.meta.env.VITE_IASTED_API_URL || 'http://localhost:8000/api/v1';

export interface IAstedConfig {
  apiUrl?: string;
  token?: string;
}

export interface VoiceSession {
  session_id: string;
  ws_url: string;
  expires_in: number;
}

export interface Conversation {
  id: string;
  user_id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  turns_count: number;
  status: string;
}

export interface ArtifactRequest {
  topic: string;
  sections: string[];
  artifact_type: 'pdf_report' | 'presentation' | 'spreadsheet' | 'diagram';
}

export interface ArtifactResponse {
  artifact_id: string;
  status: 'processing' | 'completed' | 'failed';
  download_url?: string;
  created_at: string;
}

class IAstedApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(config: IAstedConfig = {}) {
    this.client = axios.create({
      baseURL: config.apiUrl || IASTED_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (config.token) {
      this.setToken(config.token);
    }

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ Erreur API iAsted:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async createVoiceSession(): Promise<VoiceSession> {
    const response = await this.client.post('/voice/sessions');
    return response.data;
  }

  async endVoiceSession(sessionId: string): Promise<void> {
    await this.client.delete(`/voice/sessions/${sessionId}`);
  }

  async getConversations(limit = 50, offset = 0): Promise<Conversation[]> {
    const response = await this.client.get('/conversations', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await this.client.get(`/conversations/${id}`);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/conversations/${id}`);
  }

  async generateArtifact(request: ArtifactRequest): Promise<ArtifactResponse> {
    const response = await this.client.post('/artifacts/generate', request);
    return response.data;
  }

  async getArtifact(id: string): Promise<ArtifactResponse> {
    const response = await this.client.get(`/artifacts/${id}`);
    return response.data;
  }

  async getArtifacts(limit = 50, offset = 0): Promise<ArtifactResponse[]> {
    const response = await this.client.get('/artifacts', {
      params: { limit, offset },
    });
    return response.data;
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const iastedClient = new IAstedApiClient();

export default iastedClient;

