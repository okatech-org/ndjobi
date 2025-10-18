-- Table pour stocker toutes les conversations avec iAsted
CREATE TABLE IF NOT EXISTS iasted_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('voice', 'text')),
  
  -- Question de l'utilisateur
  user_message TEXT NOT NULL,
  user_message_audio_url TEXT,
  user_message_transcription TEXT,
  
  -- Réponse de l'assistant
  assistant_message TEXT NOT NULL,
  assistant_audio_url TEXT,
  
  -- Métadonnées contextuelles
  context_data JSONB DEFAULT '{}'::jsonb,
  artifacts_generated TEXT[] DEFAULT '{}',
  
  -- Actions déclenchées
  actions_triggered JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,
  
  -- Index de recherche
  user_message_vector tsvector GENERATED ALWAYS AS (to_tsvector('french', user_message)) STORED
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_iasted_user ON iasted_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_iasted_session ON iasted_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_iasted_created ON iasted_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iasted_search ON iasted_conversations USING GIN(user_message_vector);

-- RLS : Seul l'admin peut accéder
ALTER TABLE iasted_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view iasted conversations"
  ON iasted_conversations FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admin can insert iasted conversations"
  ON iasted_conversations FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table pour la base de connaissances enrichie
CREATE TABLE IF NOT EXISTS iasted_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Type de connaissance
  knowledge_type TEXT NOT NULL CHECK (knowledge_type IN (
    'agent_performance', 
    'pattern_corruption', 
    'regional_insight',
    'ministry_analysis',
    'presidential_decision',
    'strategic_recommendation'
  )),
  
  -- Contenu
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  
  -- Source
  source_conversation_id UUID REFERENCES iasted_conversations(id),
  source_data JSONB DEFAULT '{}'::jsonb,
  
  -- Métadonnées
  tags TEXT[] DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  relevance_score DECIMAL(3,2) DEFAULT 0.5,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  
  -- Vecteur de recherche
  content_vector tsvector GENERATED ALWAYS AS (to_tsvector('french', title || ' ' || content)) STORED
);

CREATE INDEX IF NOT EXISTS idx_kb_type ON iasted_knowledge_base(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_kb_search ON iasted_knowledge_base USING GIN(content_vector);
CREATE INDEX IF NOT EXISTS idx_kb_tags ON iasted_knowledge_base USING GIN(tags);

ALTER TABLE iasted_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can access knowledge base"
  ON iasted_knowledge_base FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));