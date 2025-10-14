-- ============================================
-- MIGRATION: Système d'Identité d'Appareil
-- Date: 2025-10-14
-- Description: Tables pour lier historique anonyme → compte authentifié
-- ============================================

-- ============================================
-- TABLE 1: device_sessions
-- Stocke les sessions d'appareils
-- ============================================
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiants appareil
  device_id TEXT NOT NULL UNIQUE,
  fingerprint_hash TEXT NOT NULL,
  fingerprint_data JSONB, -- Données complètes du fingerprint
  
  -- Liaison utilisateur (NULL si pas encore lié)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ, -- Quand l'appareil a été lié à un compte
  
  -- Tracking
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_count INTEGER DEFAULT 1,
  
  -- Métadonnées
  user_agent TEXT,
  platform TEXT,
  timezone TEXT,
  language TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON public.device_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint_hash ON public.device_sessions(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON public.device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_last_seen ON public.device_sessions(last_seen DESC);

-- Trigger updated_at
CREATE TRIGGER update_device_sessions_updated_at
  BEFORE UPDATE ON public.device_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.device_sessions IS 'Sessions des appareils pour reconnaissance pré-authentification';

-- ============================================
-- TABLE 2: device_signalements
-- Lie les signalements anonymes aux appareils
-- ============================================
CREATE TABLE IF NOT EXISTS public.device_signalements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Appareil
  device_id TEXT NOT NULL,
  
  -- Signalement
  signalement_id UUID NOT NULL REFERENCES public.signalements(id) ON DELETE CASCADE,
  
  -- Migration
  migrated_at TIMESTAMPTZ, -- Quand lié au compte
  migrated_to_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_device_signalements_device_id ON public.device_signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_device_signalements_signalement_id ON public.device_signalements(signalement_id);
CREATE INDEX IF NOT EXISTS idx_device_signalements_migrated ON public.device_signalements(migrated_at) WHERE migrated_at IS NULL;

COMMENT ON TABLE public.device_signalements IS 'Liaison signalements anonymes ↔ appareils';

-- ============================================
-- TABLE 3: device_projets
-- Lie les projets anonymes aux appareils
-- ============================================
CREATE TABLE IF NOT EXISTS public.device_projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Appareil
  device_id TEXT NOT NULL,
  
  -- Projet
  projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
  
  -- Migration
  migrated_at TIMESTAMPTZ,
  migrated_to_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_device_projets_device_id ON public.device_projets(device_id);
CREATE INDEX IF NOT EXISTS idx_device_projets_projet_id ON public.device_projets(projet_id);
CREATE INDEX IF NOT EXISTS idx_device_projets_migrated ON public.device_projets(migrated_at) WHERE migrated_at IS NULL;

COMMENT ON TABLE public.device_projets IS 'Liaison projets anonymes ↔ appareils';

-- ============================================
-- RLS POLICIES
-- ============================================

-- device_sessions: Lecture publique limitée
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read their own device session"
  ON public.device_sessions
  FOR SELECT
  USING (TRUE); -- Permet lecture par device_id (pas de user_id requis)

CREATE POLICY "Anyone can insert device session"
  ON public.device_sessions
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update their device session"
  ON public.device_sessions
  FOR UPDATE
  USING (TRUE);

CREATE POLICY "Super admins can manage all device sessions"
  ON public.device_sessions
  FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- device_signalements: Lecture publique
ALTER TABLE public.device_signalements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read device signalements"
  ON public.device_signalements
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can insert device signalements"
  ON public.device_signalements
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "System can update device signalements for migration"
  ON public.device_signalements
  FOR UPDATE
  USING (TRUE);

-- device_projets: Lecture publique
ALTER TABLE public.device_projets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read device projets"
  ON public.device_projets
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can insert device projets"
  ON public.device_projets
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "System can update device projets for migration"
  ON public.device_projets
  FOR UPDATE
  USING (TRUE);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour récupérer l'historique d'un appareil
CREATE OR REPLACE FUNCTION public.get_device_history(p_device_id TEXT)
RETURNS TABLE (
  signalements_count INTEGER,
  projets_count INTEGER,
  signalement_ids UUID[],
  projet_ids UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH sig_data AS (
    SELECT 
      COUNT(*)::INTEGER as sig_count,
      ARRAY_AGG(signalement_id) as sig_ids
    FROM public.device_signalements
    WHERE device_id = p_device_id
    AND migrated_at IS NULL
  ),
  proj_data AS (
    SELECT 
      COUNT(*)::INTEGER as proj_count,
      ARRAY_AGG(projet_id) as proj_ids
    FROM public.device_projets
    WHERE device_id = p_device_id
    AND migrated_at IS NULL
  )
  SELECT 
    COALESCE(s.sig_count, 0),
    COALESCE(p.proj_count, 0),
    s.sig_ids,
    p.proj_ids
  FROM sig_data s
  CROSS JOIN proj_data p;
END;
$$;

COMMENT ON FUNCTION public.get_device_history IS 'Récupère l''historique complet d''un appareil';

-- Fonction pour migrer l'historique vers un utilisateur
CREATE OR REPLACE FUNCTION public.migrate_device_to_user(
  p_device_id TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  signalements_linked INTEGER,
  projets_linked INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sig_count INTEGER := 0;
  v_proj_count INTEGER := 0;
  v_signalement_ids UUID[];
  v_projet_ids UUID[];
BEGIN
  -- 1. Lier la session de l'appareil
  UPDATE public.device_sessions
  SET 
    user_id = p_user_id,
    linked_at = NOW()
  WHERE device_id = p_device_id;

  -- 2. Récupérer les IDs des signalements non migrés
  SELECT ARRAY_AGG(signalement_id)
  INTO v_signalement_ids
  FROM public.device_signalements
  WHERE device_id = p_device_id
  AND migrated_at IS NULL;

  -- 3. Migrer les signalements
  IF v_signalement_ids IS NOT NULL THEN
    UPDATE public.signalements
    SET user_id = p_user_id
    WHERE id = ANY(v_signalement_ids);
    
    UPDATE public.device_signalements
    SET 
      migrated_at = NOW(),
      migrated_to_user = p_user_id
    WHERE device_id = p_device_id
    AND signalement_id = ANY(v_signalement_ids);
    
    v_sig_count := array_length(v_signalement_ids, 1);
  END IF;

  -- 4. Récupérer les IDs des projets non migrés
  SELECT ARRAY_AGG(projet_id)
  INTO v_projet_ids
  FROM public.device_projets
  WHERE device_id = p_device_id
  AND migrated_at IS NULL;

  -- 5. Migrer les projets
  IF v_projet_ids IS NOT NULL THEN
    UPDATE public.projets
    SET user_id = p_user_id
    WHERE id = ANY(v_projet_ids);
    
    UPDATE public.device_projets
    SET 
      migrated_at = NOW(),
      migrated_to_user = p_user_id
    WHERE device_id = p_device_id
    AND projet_id = ANY(v_projet_ids);
    
    v_proj_count := array_length(v_projet_ids, 1);
  END IF;

  -- 6. Retourner les résultats
  RETURN QUERY
  SELECT 
    TRUE as success,
    COALESCE(v_sig_count, 0) as signalements_linked,
    COALESCE(v_proj_count, 0) as projets_linked;

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, retourner échec
  RETURN QUERY
  SELECT 
    FALSE as success,
    0 as signalements_linked,
    0 as projets_linked;
END;
$$;

COMMENT ON FUNCTION public.migrate_device_to_user IS 'Migre l''historique d''un appareil vers un utilisateur authentifié';

-- ============================================
-- TRIGGER AUTOMATIQUE À LA CRÉATION DE COMPTE
-- ============================================

-- Fonction trigger pour migration auto
CREATE OR REPLACE FUNCTION public.auto_migrate_device_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id TEXT;
  v_result RECORD;
BEGIN
  -- Note: Le device_id devrait être passé via metadata lors du signup
  -- Pour l'instant, on le récupère depuis les métadonnées du user
  v_device_id := NEW.raw_user_meta_data->>'device_id';
  
  IF v_device_id IS NOT NULL THEN
    -- Appeler la fonction de migration
    SELECT * INTO v_result
    FROM public.migrate_device_to_user(v_device_id, NEW.id);
    
    -- Logger le résultat
    RAISE NOTICE 'Device migration for user %: % signalements, % projets', 
      NEW.id, 
      v_result.signalements_linked, 
      v_result.projets_linked;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_migrate_device ON auth.users;
CREATE TRIGGER trigger_auto_migrate_device
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_migrate_device_on_signup();

COMMENT ON FUNCTION public.auto_migrate_device_on_signup IS 'Migration automatique de l''historique appareil lors de la création d''un compte';

-- ============================================
-- VUES UTILITAIRES
-- ============================================

-- Vue: Appareils actifs avec leur historique
CREATE OR REPLACE VIEW public.active_devices_with_history AS
SELECT 
  ds.device_id,
  ds.fingerprint_hash,
  ds.user_id,
  ds.linked_at,
  ds.first_seen,
  ds.last_seen,
  ds.session_count,
  COUNT(DISTINCT dsig.signalement_id) FILTER (WHERE dsig.migrated_at IS NULL) as pending_signalements,
  COUNT(DISTINCT dproj.projet_id) FILTER (WHERE dproj.migrated_at IS NULL) as pending_projets
FROM public.device_sessions ds
LEFT JOIN public.device_signalements dsig ON ds.device_id = dsig.device_id
LEFT JOIN public.device_projets dproj ON ds.device_id = dproj.device_id
WHERE ds.last_seen > NOW() - INTERVAL '90 days'
GROUP BY ds.id;

COMMENT ON VIEW public.active_devices_with_history IS 'Vue des appareils actifs avec leur historique non migré';

-- ============================================
-- MODIFICATIONS DE LA TABLE signalements
-- ============================================

-- Permettre user_id NULL pour signalements anonymes
ALTER TABLE public.signalements 
  ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter colonne pour tracking device
ALTER TABLE public.signalements 
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Ajouter colonnes GPS si pas déjà présentes
ALTER TABLE public.signalements 
  ADD COLUMN IF NOT EXISTS gps_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS gps_longitude DECIMAL(11, 8);

-- Ajouter colonne méthode de soumission
ALTER TABLE public.signalements 
  ADD COLUMN IF NOT EXISTS submission_method TEXT DEFAULT 'chat_ai';

-- Index
CREATE INDEX IF NOT EXISTS idx_signalements_device_id ON public.signalements(device_id) WHERE device_id IS NOT NULL;

-- ============================================
-- MODIFICATIONS DE LA TABLE projets
-- ============================================

-- Permettre user_id NULL pour projets anonymes
ALTER TABLE public.projets 
  ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter colonne device
ALTER TABLE public.projets 
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Index
CREATE INDEX IF NOT EXISTS idx_projets_device_id ON public.projets(device_id) WHERE device_id IS NOT NULL;

-- ============================================
-- POLITIQUE RLS MISE À JOUR
-- ============================================

-- Mettre à jour les policies pour signalements
DROP POLICY IF EXISTS "Users can view their own signalements" ON public.signalements;

CREATE POLICY "Users can view their own signalements or device signalements"
  ON public.signalements
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR device_id IN (
      SELECT device_id 
      FROM public.device_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Permettre insertion anonyme
DROP POLICY IF EXISTS "Users can create signalements" ON public.signalements;

CREATE POLICY "Anyone can create signalements"
  ON public.signalements
  FOR INSERT
  WITH CHECK (TRUE); -- Validation côté app

-- Mettre à jour les policies pour projets
DROP POLICY IF EXISTS "Users can view their own projets" ON public.projets;

CREATE POLICY "Users can view their own projets or device projets"
  ON public.projets
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR device_id IN (
      SELECT device_id 
      FROM public.device_sessions 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create projets" ON public.projets;

CREATE POLICY "Anyone can create projets"
  ON public.projets
  FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- FONCTION DE NETTOYAGE (Maintenance)
-- ============================================

-- Nettoie les anciennes sessions inactives (> 1 an)
CREATE OR REPLACE FUNCTION public.cleanup_old_device_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Supprimer les sessions non liées et inactives depuis > 1 an
  DELETE FROM public.device_sessions
  WHERE user_id IS NULL
  AND last_seen < NOW() - INTERVAL '365 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Nettoyage: % anciennes sessions supprimées', v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_device_sessions IS 'Nettoie les sessions d''appareils inactives depuis > 1 an';

-- ============================================
-- STATISTIQUES & ANALYTICS
-- ============================================

-- Vue: Statistiques de migration
CREATE OR REPLACE VIEW public.device_migration_stats AS
SELECT 
  COUNT(DISTINCT device_id) as total_devices,
  COUNT(DISTINCT device_id) FILTER (WHERE user_id IS NOT NULL) as linked_devices,
  COUNT(DISTINCT device_id) FILTER (WHERE user_id IS NULL) as anonymous_devices,
  ROUND(
    100.0 * COUNT(DISTINCT device_id) FILTER (WHERE user_id IS NOT NULL) / 
    NULLIF(COUNT(DISTINCT device_id), 0),
    2
  ) as conversion_rate,
  AVG(session_count) as avg_sessions_per_device
FROM public.device_sessions;

COMMENT ON VIEW public.device_migration_stats IS 'Statistiques de conversion anonyme → authentifié';

-- Vue: Appareils avec le plus d'activité
CREATE OR REPLACE VIEW public.top_active_devices AS
SELECT 
  ds.device_id,
  ds.user_id,
  ds.session_count,
  ds.first_seen,
  ds.last_seen,
  COUNT(DISTINCT dsig.signalement_id) as total_signalements,
  COUNT(DISTINCT dproj.projet_id) as total_projets,
  (ds.last_seen - ds.first_seen) as usage_duration
FROM public.device_sessions ds
LEFT JOIN public.device_signalements dsig ON ds.device_id = dsig.device_id
LEFT JOIN public.device_projets dproj ON ds.device_id = dproj.device_id
GROUP BY ds.id
ORDER BY 
  COUNT(DISTINCT dsig.signalement_id) + COUNT(DISTINCT dproj.projet_id) DESC,
  ds.session_count DESC
LIMIT 100;

COMMENT ON VIEW public.top_active_devices IS 'Top 100 appareils les plus actifs';

-- ============================================
-- GRANTS
-- ============================================

-- Permettre à l'API d'accéder aux tables
GRANT SELECT, INSERT, UPDATE ON public.device_sessions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.device_signalements TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.device_projets TO authenticated, anon;

-- Exécution des fonctions
GRANT EXECUTE ON FUNCTION public.get_device_history TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.migrate_device_to_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_old_device_sessions TO postgres;

-- Vues
GRANT SELECT ON public.active_devices_with_history TO authenticated;
GRANT SELECT ON public.device_migration_stats TO authenticated;
GRANT SELECT ON public.top_active_devices TO authenticated;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================

