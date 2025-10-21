-- Migration: Tables de configuration Super Admin
-- Description: Création des tables pour stocker les configurations du Super Admin
-- Date: 2025-10-21

-- Table: api_keys
-- Description: Stockage sécurisé des clés API pour les services externes
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('openai', 'claude', 'gemini', 'google', 'azure', 'twilio', 'custom')),
  key_encrypted TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  last_used TIMESTAMPTZ,
  usage INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);

-- Table: connected_apps
-- Description: Applications tierces connectées à la plateforme
CREATE TABLE IF NOT EXISTS connected_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('storage', 'analytics', 'communication', 'database', 'auth', 'monitoring', 'other')),
  url TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_connected_apps_type ON connected_apps(type);
CREATE INDEX IF NOT EXISTS idx_connected_apps_status ON connected_apps(status);
CREATE INDEX IF NOT EXISTS idx_connected_apps_created_by ON connected_apps(created_by);

-- Table: mcp_configs
-- Description: Configurations MCP (Model Context Protocol)
CREATE TABLE IF NOT EXISTS mcp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('http', 'websocket', 'grpc')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_connected TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_mcp_configs_protocol ON mcp_configs(protocol);
CREATE INDEX IF NOT EXISTS idx_mcp_configs_status ON mcp_configs(status);
CREATE INDEX IF NOT EXISTS idx_mcp_configs_created_by ON mcp_configs(created_by);

-- Table: ai_agents
-- Description: Agents IA configurés et actifs
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure', 'local', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training', 'error')),
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_used TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_provider ON ai_agents(provider);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_created_by ON ai_agents(created_by);

-- Fonction de mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_apps_updated_at
  BEFORE UPDATE ON connected_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_configs_updated_at
  BEFORE UPDATE ON mcp_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Seuls les super_admin peuvent accéder
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les super_admin peuvent tout faire
CREATE POLICY "Super admin full access to api_keys"
  ON api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin full access to connected_apps"
  ON connected_apps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin full access to mcp_configs"
  ON mcp_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin full access to ai_agents"
  ON ai_agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Insertion de données par défaut (exemples pour démarrer)
INSERT INTO api_keys (name, service, key_encrypted, status, usage, usage_limit, metadata) VALUES
  ('OpenAI GPT-4', 'openai', 'encrypted_key_placeholder_1', 'active', 1250, 10000, '{"description": "Clé API production OpenAI"}'),
  ('Claude 3.5 Sonnet', 'claude', 'encrypted_key_placeholder_2', 'active', 850, 5000, '{"description": "Clé API Anthropic Claude"}'),
  ('Google Gemini 1.5 Pro', 'gemini', 'encrypted_key_placeholder_3', 'inactive', 0, 20000, '{"description": "Clé API Google Gemini"}'),
  ('Twilio Verify / SMS', 'twilio', 'encrypted_key_placeholder_4', 'active', 420, 100000, '{"description": "Service SMS et vérification"}')
ON CONFLICT DO NOTHING;

INSERT INTO connected_apps (name, type, url, status, config) VALUES
  ('Supabase Database', 'database', 'https://supabase.ndjobi.com', 'connected', '{"version": "2.x"}'),
  ('Google Analytics', 'analytics', 'https://analytics.google.com', 'connected', '{"tracking_id": "GA-XXXXX"}'),
  ('Sentry Error Tracking', 'monitoring', 'https://sentry.io', 'connected', '{"dsn": "https://..."}'),
  ('Twilio Communications', 'communication', 'https://twilio.com', 'connected', '{"account_sid": "AC..."}')
ON CONFLICT DO NOTHING;

INSERT INTO mcp_configs (name, endpoint, protocol, status, capabilities) VALUES
  ('File System MCP', 'http://localhost:3001/mcp', 'http', 'active', ARRAY['read', 'write', 'list']),
  ('Database MCP', 'ws://localhost:3002/mcp', 'websocket', 'active', ARRAY['query', 'schema', 'migrate']),
  ('API Gateway MCP', 'grpc://localhost:3003', 'grpc', 'inactive', ARRAY['proxy', 'auth', 'rate-limit'])
ON CONFLICT DO NOTHING;

INSERT INTO ai_agents (name, model, provider, status, capabilities, usage_count) VALUES
  ('Ndjobi Assistant', 'gpt-4-turbo', 'openai', 'active', ARRAY['chat', 'analysis', 'reporting'], 1523),
  ('Document Analyzer', 'claude-3-sonnet', 'anthropic', 'active', ARRAY['ocr', 'summarize', 'classify'], 892),
  ('Data Processor', 'gemini-1.5-pro', 'google', 'inactive', ARRAY['transform', 'validate', 'enrich'], 0)
ON CONFLICT DO NOTHING;

-- Commentaires sur les tables
COMMENT ON TABLE api_keys IS 'Stockage sécurisé des clés API pour les services externes (OpenAI, Claude, Twilio, etc.)';
COMMENT ON TABLE connected_apps IS 'Applications tierces connectées à la plateforme (Supabase, Analytics, Monitoring, etc.)';
COMMENT ON TABLE mcp_configs IS 'Configurations MCP (Model Context Protocol) pour l''intégration avec des systèmes externes';
COMMENT ON TABLE ai_agents IS 'Agents IA configurés et actifs sur la plateforme avec leurs capacités respectives';

COMMENT ON COLUMN api_keys.key_encrypted IS 'Clé API chiffrée - Ne jamais stocker en clair';
COMMENT ON COLUMN api_keys.usage IS 'Nombre d''utilisations de la clé API';
COMMENT ON COLUMN api_keys.usage_limit IS 'Limite d''utilisation mensuelle';
COMMENT ON COLUMN connected_apps.last_sync IS 'Dernière synchronisation réussie avec l''application';
COMMENT ON COLUMN mcp_configs.capabilities IS 'Liste des capacités supportées par ce MCP';
COMMENT ON COLUMN ai_agents.usage_count IS 'Nombre total d''utilisations de l''agent IA';

