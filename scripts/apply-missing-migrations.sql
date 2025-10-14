-- ============================================
-- CRÉATION DES TABLES MANQUANTES
-- ============================================
-- Exécuter dans Supabase Studio SQL Editor
-- http://127.0.0.1:54323/project/default/editor

-- 1. Table device_sessions (pour l'identité des appareils)
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  fingerprint_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table device_signalements
CREATE TABLE IF NOT EXISTS public.device_signalements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  signalement_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  migrated_at TIMESTAMP WITH TIME ZONE,
  migrated_to_user UUID REFERENCES auth.users(id)
);

-- 3. Table device_projets
CREATE TABLE IF NOT EXISTS public.device_projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  projet_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  migrated_at TIMESTAMP WITH TIME ZONE,
  migrated_to_user UUID REFERENCES auth.users(id)
);

-- 4. Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON public.device_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint ON public.device_sessions(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON public.device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_signalements_device_id ON public.device_signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_device_projets_device_id ON public.device_projets(device_id);

-- 5. Activer RLS
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_projets ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS
-- device_sessions
CREATE POLICY "device_sessions_insert" ON public.device_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "device_sessions_select" ON public.device_sessions
FOR SELECT USING (
  device_id IS NOT NULL OR 
  user_id = auth.uid()
);

CREATE POLICY "device_sessions_update" ON public.device_sessions
FOR UPDATE USING (
  device_id IS NOT NULL OR 
  user_id = auth.uid()
);

-- device_signalements
CREATE POLICY "device_signalements_insert" ON public.device_signalements
FOR INSERT WITH CHECK (true);

CREATE POLICY "device_signalements_select" ON public.device_signalements
FOR SELECT USING (true);

-- device_projets
CREATE POLICY "device_projets_insert" ON public.device_projets
FOR INSERT WITH CHECK (true);

CREATE POLICY "device_projets_select" ON public.device_projets
FOR SELECT USING (true);

-- 7. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Tables device_sessions créées avec succès';
  RAISE NOTICE '✅ Politiques RLS configurées';
  RAISE NOTICE '✅ Index créés pour performance';
END $$;
