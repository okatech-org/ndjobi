-- Migration pour Dashboard Protocole d'État
-- Tables pour gérer les décisions présidentielles et KPIs nationaux

-- 1. Table pour les décisions présidentielles
CREATE TABLE IF NOT EXISTS presidential_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signalement_id UUID REFERENCES signalements(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('approuver', 'rejeter', 'enquete')),
  motif TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table pour les directives présidentielles
CREATE TABLE IF NOT EXISTS presidential_directives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  target_ministries TEXT[] DEFAULT '{}',
  priority TEXT CHECK (priority IN ('Haute', 'Moyenne', 'Basse')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table pour les KPIs nationaux (cache)
CREATE TABLE IF NOT EXISTS national_kpis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_signalements INTEGER DEFAULT 0,
  signalements_critiques INTEGER DEFAULT 0,
  taux_resolution DECIMAL(5,2) DEFAULT 0,
  impact_economique BIGINT DEFAULT 0,
  score_transparence INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table pour la performance des Sous-Admins
CREATE TABLE IF NOT EXISTS subadmin_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  cas_traites INTEGER DEFAULT 0,
  taux_succes DECIMAL(5,2) DEFAULT 0,
  delai_moyen_jours DECIMAL(5,2) DEFAULT 0,
  statut TEXT DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Attention', 'Inactif')),
  metadata JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_presidential_decisions_signalement 
  ON presidential_decisions(signalement_id);
CREATE INDEX IF NOT EXISTS idx_presidential_decisions_decided_at 
  ON presidential_decisions(decided_at DESC);
CREATE INDEX IF NOT EXISTS idx_national_kpis_period 
  ON national_kpis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_subadmin_performance_user 
  ON subadmin_performance(user_id, period_start);

-- 6. Row Level Security (RLS)
ALTER TABLE presidential_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presidential_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE subadmin_performance ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Seuls les admins peuvent accéder
CREATE POLICY "Admins can view presidential decisions"
  ON presidential_decisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert presidential decisions"
  ON presidential_decisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view directives"
  ON presidential_directives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert directives"
  ON presidential_directives FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view national KPIs"
  ON national_kpis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view subadmin performance"
  ON subadmin_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Commentaires pour documentation
COMMENT ON TABLE presidential_decisions IS 'Enregistrement des décisions présidentielles sur les cas de corruption';
COMMENT ON TABLE presidential_directives IS 'Directives présidentielles diffusées aux ministères';
COMMENT ON TABLE national_kpis IS 'KPIs nationaux calculés pour le dashboard Protocole d''État';
COMMENT ON TABLE subadmin_performance IS 'Performance des sous-administrateurs (DGSS, DGR, DGLIC, etc.)';

