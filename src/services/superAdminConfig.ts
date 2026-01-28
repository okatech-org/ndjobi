/**
 * Service de configuration Super Admin
 * Note: Les tables api_keys, connected_apps, mcp_configs, ai_agents n'existent pas dans le schéma actuel
 * Les méthodes retournent des données vides ou des fallbacks en attendant la création des tables
 */

export interface ApiKey {
  id: string;
  name: string;
  service: 'openai' | 'claude' | 'gemini' | 'google' | 'azure' | 'twilio' | 'custom';
  key: string;
  status: 'active' | 'inactive' | 'expired';
  lastUsed?: string;
  usage: number;
  limit: number;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface ConnectedApp {
  id: string;
  name: string;
  type: 'storage' | 'analytics' | 'communication' | 'database' | 'auth' | 'monitoring' | 'other';
  url?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  created_at?: string;
  config?: Record<string, any>;
}

export interface MCPConfig {
  id: string;
  name: string;
  endpoint: string;
  protocol: 'http' | 'websocket' | 'grpc';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  lastConnected?: string;
  created_at?: string;
  config?: Record<string, any>;
}

export interface AIAgent {
  id: string;
  name: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local' | 'other';
  status: 'active' | 'inactive' | 'training' | 'error';
  capabilities: string[];
  lastUsed?: string;
  usageCount?: number;
  created_at?: string;
  config?: Record<string, any>;
}

class SuperAdminConfigService {
  // API Keys - Table doesn't exist, returning empty array
  async getAllApiKeys(): Promise<ApiKey[]> {
    console.log('[SuperAdminConfig] api_keys table not available');
    return [];
  }

  async addApiKey(_apiKey: Omit<ApiKey, 'id' | 'created_at'>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot add API key - table does not exist');
    throw new Error('api_keys table not available');
  }

  async updateApiKey(_id: string, _updates: Partial<ApiKey>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot update API key - table does not exist');
    throw new Error('api_keys table not available');
  }

  async deleteApiKey(_id: string): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot delete API key - table does not exist');
    throw new Error('api_keys table not available');
  }

  // Connected Apps - Table doesn't exist, returning empty array
  async getAllConnectedApps(): Promise<ConnectedApp[]> {
    console.log('[SuperAdminConfig] connected_apps table not available');
    return [];
  }

  async addConnectedApp(_app: Omit<ConnectedApp, 'id' | 'created_at'>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot add connected app - table does not exist');
    throw new Error('connected_apps table not available');
  }

  async updateConnectedApp(_id: string, _updates: Partial<ConnectedApp>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot update connected app - table does not exist');
    throw new Error('connected_apps table not available');
  }

  async deleteConnectedApp(_id: string): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot delete connected app - table does not exist');
    throw new Error('connected_apps table not available');
  }

  // MCP Configs - Table doesn't exist, returning empty array
  async getAllMCPConfigs(): Promise<MCPConfig[]> {
    console.log('[SuperAdminConfig] mcp_configs table not available');
    return [];
  }

  async addMCPConfig(_mcp: Omit<MCPConfig, 'id' | 'created_at'>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot add MCP config - table does not exist');
    throw new Error('mcp_configs table not available');
  }

  async updateMCPConfig(_id: string, _updates: Partial<MCPConfig>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot update MCP config - table does not exist');
    throw new Error('mcp_configs table not available');
  }

  async deleteMCPConfig(_id: string): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot delete MCP config - table does not exist');
    throw new Error('mcp_configs table not available');
  }

  // AI Agents - Table doesn't exist, returning empty array
  async getAllAIAgents(): Promise<AIAgent[]> {
    console.log('[SuperAdminConfig] ai_agents table not available');
    return [];
  }

  async addAIAgent(_agent: Omit<AIAgent, 'id' | 'created_at'>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot add AI agent - table does not exist');
    throw new Error('ai_agents table not available');
  }

  async updateAIAgent(_id: string, _updates: Partial<AIAgent>): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot update AI agent - table does not exist');
    throw new Error('ai_agents table not available');
  }

  async deleteAIAgent(_id: string): Promise<void> {
    console.warn('[SuperAdminConfig] Cannot delete AI agent - table does not exist');
    throw new Error('ai_agents table not available');
  }
}

export const superAdminConfigService = new SuperAdminConfigService();
export default superAdminConfigService;
