-- ============================================
-- 1. Ajouter la colonne metadata à profiles
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.metadata IS 
'Stocke les informations supplémentaires: role_type (sub_admin_dgss, sub_admin_dgr, agent_defense, etc.), department, sector';

-- ============================================
-- 2. Nouvelles politiques RLS pour profiles
-- ============================================

-- Politique 1: Admins peuvent modifier tous les profils
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Politique 2: Agents peuvent voir les profils pertinents
-- Les agents voient leur profil + profils des users de leurs signalements assignés
CREATE POLICY "Agents can view relevant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'agent'::app_role) AND (
    id = auth.uid() OR
    id IN (
      SELECT DISTINCT s.user_id 
      FROM public.signalements s
      WHERE s.metadata->>'assigned_agent_id' = auth.uid()::text
    )
  )
);

-- Politique 3: Sous-admins voient les profils de leur secteur
CREATE POLICY "Sub-admins can view sector profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.metadata->>'role_type' IN ('sub_admin_dgss', 'sub_admin_dgr')
  ) AND (
    id IN (
      SELECT p.id FROM public.profiles p
      WHERE p.metadata->>'department' = (
        SELECT metadata->>'department' 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    id IN (
      SELECT DISTINCT s.user_id
      FROM public.signalements s
      WHERE s.metadata->>'sector' = (
        SELECT metadata->>'department'
        FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  )
);