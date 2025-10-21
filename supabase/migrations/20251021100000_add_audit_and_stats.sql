-- Migration: Ajout de la table admin_audit_log et fonction get_database_stats
-- Date: 2025-10-21

-- Création de la table admin_audit_log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_severity ON public.admin_audit_log(severity);

-- RLS Policies
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les super admins peuvent lire les logs d'audit
CREATE POLICY "Super admins can read audit logs"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Politique: Le système peut insérer des logs
CREATE POLICY "System can insert audit logs"
  ON public.admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fonction RPC: get_database_stats
-- Retourne les statistiques de la base de données
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  table_size TEXT,
  index_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::TEXT AS table_name,
    c.reltuples::BIGINT AS row_count,
    pg_size_pretty(pg_total_relation_size(c.oid))::TEXT AS table_size,
    COUNT(i.indexrelid)::INTEGER AS index_count
  FROM pg_class c
  LEFT JOIN pg_index i ON c.oid = i.indrelid
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname = 'public'
    AND c.relname NOT LIKE 'pg_%'
    AND c.relname NOT LIKE 'sql_%'
  GROUP BY c.oid, c.relname, c.reltuples
  ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$;

-- Grant execute sur la fonction pour authenticated users
GRANT EXECUTE ON FUNCTION public.get_database_stats() TO authenticated;

-- Commentaires
COMMENT ON TABLE public.admin_audit_log IS 'Journal d''audit des actions administratives';
COMMENT ON FUNCTION public.get_database_stats() IS 'Retourne les statistiques des tables de la base de données';

