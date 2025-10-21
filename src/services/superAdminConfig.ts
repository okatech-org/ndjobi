import { supabase } from '@/integrations/supabase/client';

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
  async getAllApiKeys(): Promise<ApiKey[]> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        service: item.service,
        key: item.key_encrypted,
        status: item.status,
        lastUsed: item.last_used,
        usage: item.usage || 0,
        limit: item.usage_limit || 1000,
        created_at: item.created_at,
        metadata: item.metadata || {},
      }));
    } catch (error) {
      console.error('Erreur récupération clés API:', error);
      return [];
    }
  }

  async addApiKey(apiKey: Omit<ApiKey, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase.from('api_keys').insert([{
        name: apiKey.name,
        service: apiKey.service,
        key_encrypted: apiKey.key,
        status: apiKey.status || 'active',
        usage: apiKey.usage || 0,
        usage_limit: apiKey.limit || 1000,
        last_used: apiKey.lastUsed || null,
        metadata: apiKey.metadata || {},
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur ajout clé API:', error);
      throw error;
    }
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.service && { service: updates.service }),
          ...(updates.key && { key_encrypted: updates.key }),
          ...(updates.status && { status: updates.status }),
          ...(updates.usage !== undefined && { usage: updates.usage }),
          ...(updates.limit !== undefined && { usage_limit: updates.limit }),
          ...(updates.lastUsed && { last_used: updates.lastUsed }),
          ...(updates.metadata && { metadata: updates.metadata }),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour clé API:', error);
      throw error;
    }
  }

  async deleteApiKey(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression clé API:', error);
      throw error;
    }
  }

  async getAllConnectedApps(): Promise<ConnectedApp[]> {
    try {
      const { data, error } = await supabase
        .from('connected_apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        url: item.url,
        status: item.status,
        lastSync: item.last_sync,
        created_at: item.created_at,
        config: item.config || {},
      }));
    } catch (error) {
      console.error('Erreur récupération applications:', error);
      return [];
    }
  }

  async addConnectedApp(app: Omit<ConnectedApp, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase.from('connected_apps').insert([{
        name: app.name,
        type: app.type,
        url: app.url || null,
        status: app.status || 'connected',
        last_sync: app.lastSync || null,
        config: app.config || {},
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur ajout application:', error);
      throw error;
    }
  }

  async updateConnectedApp(id: string, updates: Partial<ConnectedApp>): Promise<void> {
    try {
      const { error } = await supabase
        .from('connected_apps')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.type && { type: updates.type }),
          ...(updates.url && { url: updates.url }),
          ...(updates.status && { status: updates.status }),
          ...(updates.lastSync && { last_sync: updates.lastSync }),
          ...(updates.config && { config: updates.config }),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour application:', error);
      throw error;
    }
  }

  async deleteConnectedApp(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('connected_apps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression application:', error);
      throw error;
    }
  }

  async getAllMCPConfigs(): Promise<MCPConfig[]> {
    try {
      const { data, error } = await supabase
        .from('mcp_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        endpoint: item.endpoint,
        protocol: item.protocol,
        status: item.status,
        capabilities: item.capabilities || [],
        lastConnected: item.last_connected,
        created_at: item.created_at,
        config: item.config || {},
      }));
    } catch (error) {
      console.error('Erreur récupération MCP configs:', error);
      return [];
    }
  }

  async addMCPConfig(mcp: Omit<MCPConfig, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase.from('mcp_configs').insert([{
        name: mcp.name,
        endpoint: mcp.endpoint,
        protocol: mcp.protocol,
        status: mcp.status || 'active',
        capabilities: mcp.capabilities || [],
        last_connected: mcp.lastConnected || null,
        config: mcp.config || {},
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur ajout MCP config:', error);
      throw error;
    }
  }

  async updateMCPConfig(id: string, updates: Partial<MCPConfig>): Promise<void> {
    try {
      const { error } = await supabase
        .from('mcp_configs')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.endpoint && { endpoint: updates.endpoint }),
          ...(updates.protocol && { protocol: updates.protocol }),
          ...(updates.status && { status: updates.status }),
          ...(updates.capabilities && { capabilities: updates.capabilities }),
          ...(updates.lastConnected && { last_connected: updates.lastConnected }),
          ...(updates.config && { config: updates.config }),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour MCP config:', error);
      throw error;
    }
  }

  async deleteMCPConfig(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('mcp_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression MCP config:', error);
      throw error;
    }
  }

  async getAllAIAgents(): Promise<AIAgent[]> {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        model: item.model,
        provider: item.provider,
        status: item.status,
        capabilities: item.capabilities || [],
        lastUsed: item.last_used,
        usageCount: item.usage_count || 0,
        created_at: item.created_at,
        config: item.config || {},
      }));
    } catch (error) {
      console.error('Erreur récupération agents IA:', error);
      return [];
    }
  }

  async addAIAgent(agent: Omit<AIAgent, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase.from('ai_agents').insert([{
        name: agent.name,
        model: agent.model,
        provider: agent.provider,
        status: agent.status || 'active',
        capabilities: agent.capabilities || [],
        last_used: agent.lastUsed || null,
        usage_count: agent.usageCount || 0,
        config: agent.config || {},
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur ajout agent IA:', error);
      throw error;
    }
  }

  async updateAIAgent(id: string, updates: Partial<AIAgent>): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.model && { model: updates.model }),
          ...(updates.provider && { provider: updates.provider }),
          ...(updates.status && { status: updates.status }),
          ...(updates.capabilities && { capabilities: updates.capabilities }),
          ...(updates.lastUsed && { last_used: updates.lastUsed }),
          ...(updates.usageCount !== undefined && { usage_count: updates.usageCount }),
          ...(updates.config && { config: updates.config }),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour agent IA:', error);
      throw error;
    }
  }

  async deleteAIAgent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression agent IA:', error);
      throw error;
    }
  }
}

export const superAdminConfigService = new SuperAdminConfigService();
export default superAdminConfigService;

