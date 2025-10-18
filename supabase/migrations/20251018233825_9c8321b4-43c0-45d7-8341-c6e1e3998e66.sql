-- ========================================
-- TABLES POUR LE DASHBOARD PROTOCOLE D'ÉTAT
-- ========================================

-- 1. Table pour les décisions présidentielles
CREATE TABLE IF NOT EXISTS public.presidential_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signalement_id UUID REFERENCES public.signalements(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('approuver', 'rejeter', 'enquete')),
  motif TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table pour les directives présidentielles
CREATE TABLE IF NOT EXISTS public.presidential_directives (
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
CREATE TABLE IF NOT EXISTS public.national_kpis (
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
CREATE TABLE IF NOT EXISTS public.subadmin_performance (
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

-- ========================================
-- INDEX POUR OPTIMISATION
-- ========================================

CREATE INDEX IF NOT EXISTS idx_presidential_decisions_signalement 
  ON public.presidential_decisions(signalement_id);
CREATE INDEX IF NOT EXISTS idx_presidential_decisions_decided_at 
  ON public.presidential_decisions(decided_at DESC);
CREATE INDEX IF NOT EXISTS idx_presidential_directives_status
  ON public.presidential_directives(status, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_national_kpis_period 
  ON public.national_kpis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_subadmin_performance_user 
  ON public.subadmin_performance(user_id, period_start);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.presidential_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presidential_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subadmin_performance ENABLE ROW LEVEL SECURITY;

-- Policies pour presidential_decisions
CREATE POLICY "Admins can view presidential decisions"
  ON public.presidential_decisions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Admins can insert presidential decisions"
  ON public.presidential_decisions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update presidential decisions"
  ON public.presidential_decisions FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Policies pour presidential_directives
CREATE POLICY "Admins can view directives"
  ON public.presidential_directives FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role) OR
    public.has_role(auth.uid(), 'sub_admin'::app_role)
  );

CREATE POLICY "Admins can insert directives"
  ON public.presidential_directives FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update directives"
  ON public.presidential_directives FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Policies pour national_kpis
CREATE POLICY "Admins can view national KPIs"
  ON public.national_kpis FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role) OR
    public.has_role(auth.uid(), 'sub_admin'::app_role)
  );

CREATE POLICY "Admins can insert national KPIs"
  ON public.national_kpis FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Policies pour subadmin_performance
CREATE POLICY "Admins can view subadmin performance"
  ON public.subadmin_performance FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role) OR
    (public.has_role(auth.uid(), 'sub_admin'::app_role) AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert subadmin performance"
  ON public.subadmin_performance FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::app_role)
  );