-- ============================================
-- HIÉRARCHIE COMPLÈTE DES RÔLES NDJOBI
-- Utilisation de metadata pour distinguer les types d'admin
-- ============================================

-- Supprimer toutes les politiques RLS existantes
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "President can manage admin and agent roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view relevant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Sub-admins can view sector profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "President can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "President can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Admins can update all projets" ON public.projets;
DROP POLICY IF EXISTS "Admins can view all projets" ON public.projets;
DROP POLICY IF EXISTS "Users can create projets" ON public.projets;
DROP POLICY IF EXISTS "Users can delete their own draft projets" ON public.projets;
DROP POLICY IF EXISTS "Users can update their own projets" ON public.projets;
DROP POLICY IF EXISTS "Users can view their own projets" ON public.projets;
DROP POLICY IF EXISTS "Super admin and president can view all projets" ON public.projets;
DROP POLICY IF EXISTS "Super admin and president can update all projets" ON public.projets;
DROP POLICY IF EXISTS "Sub-admins can view sector projets" ON public.projets;

DROP POLICY IF EXISTS "Admins can delete signalements" ON public.signalements;
DROP POLICY IF EXISTS "Agents can update all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Agents can view all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Users can create signalements" ON public.signalements;
DROP POLICY IF EXISTS "Users can update their own pending signalements" ON public.signalements;
DROP POLICY IF EXISTS "Users can view their own signalements" ON public.signalements;
DROP POLICY IF EXISTS "Super admin and president can view all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Super admin and president can update all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Super admin and president can delete signalements" ON public.signalements;
DROP POLICY IF EXISTS "Sub-admins can view sector signalements" ON public.signalements;
DROP POLICY IF EXISTS "Sub-admins can update sector signalements" ON public.signalements;
DROP POLICY IF EXISTS "Agents can view assigned signalements" ON public.signalements;
DROP POLICY IF EXISTS "Agents can update assigned signalements" ON public.signalements;

-- ============================================
-- POLITIQUES RLS - TABLE user_roles
-- ============================================

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "President can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND metadata->>'role_type' = 'president'
  ) AND
  role IN ('admin'::app_role, 'agent'::app_role, 'user'::app_role)
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS - TABLE profiles
-- ============================================

-- Super Admin: Vue complète
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Président: Vue complète sur tous les profils
CREATE POLICY "President can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() AND admin_profile.metadata->>'role_type' = 'president'
  )
);

CREATE POLICY "President can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() AND admin_profile.metadata->>'role_type' = 'president'
  )
);

-- Sous-Admins (DGSS, DGR): Vue sur leur secteur uniquement
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

-- Agents: Vue sur leur propre profil et profils liés à leurs signalements
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

-- Utilisateurs: Vue uniquement sur leur propre profil
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- POLITIQUES RLS - TABLE signalements
-- ============================================

-- Super Admin et Président: Vue complète
CREATE POLICY "Super admin and president can view all signalements"
ON public.signalements
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND metadata->>'role_type' = 'president'
  ))
);

CREATE POLICY "Super admin and president can update all signalements"
ON public.signalements
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND metadata->>'role_type' = 'president'
  ))
);

CREATE POLICY "Super admin and president can delete signalements"
ON public.signalements
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND metadata->>'role_type' = 'president'
  ))
);

-- Sous-Admins: Vue sur signalements de leur secteur
CREATE POLICY "Sub-admins can view sector signalements"
ON public.signalements
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.metadata->>'role_type' IN ('sub_admin_dgss', 'sub_admin_dgr')
  ) AND
  metadata->>'sector' = (
    SELECT metadata->>'department'
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Sub-admins can update sector signalements"
ON public.signalements
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.metadata->>'role_type' IN ('sub_admin_dgss', 'sub_admin_dgr')
  ) AND
  metadata->>'sector' = (
    SELECT metadata->>'department'
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Agents: Vue sur signalements de leur ministère/assignés
CREATE POLICY "Agents can view assigned signalements"
ON public.signalements
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'agent'::app_role) AND (
    metadata->>'assigned_agent_id' = auth.uid()::text OR
    metadata->>'ministry' = (
      SELECT metadata->>'ministry'
      FROM public.profiles
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Agents can update assigned signalements"
ON public.signalements
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'agent'::app_role) AND
  metadata->>'assigned_agent_id' = auth.uid()::text
);

-- Utilisateurs: Créer et voir leurs propres signalements
CREATE POLICY "Users can create signalements"
ON public.signalements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own signalements"
ON public.signalements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending signalements"
ON public.signalements
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- ============================================
-- POLITIQUES RLS - TABLE projets
-- ============================================

-- Super Admin et Président: Vue complète
CREATE POLICY "Super admin and president can view all projets"
ON public.projets
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND metadata->>'role_type' = 'president'
  ))
);

CREATE POLICY "Super admin and president can update all projets"
ON public.projets
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND metadata->>'role_type' = 'president'
  ))
);

-- Sous-Admins: Vue sur projets de leur secteur
CREATE POLICY "Sub-admins can view sector projets"
ON public.projets
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.metadata->>'role_type' IN ('sub_admin_dgss', 'sub_admin_dgr')
  ) AND
  metadata->>'sector' = (
    SELECT metadata->>'department'
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Utilisateurs: Gérer leurs propres projets
CREATE POLICY "Users can create projets"
ON public.projets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projets"
ON public.projets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projets"
ON public.projets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft projets"
ON public.projets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'draft');

-- ============================================
-- Commentaires explicatifs
-- ============================================

COMMENT ON POLICY "Super admin and president can view all signalements" ON public.signalements IS 
'Super Admin et Président (identifié par metadata.role_type=president) ont accès à tous les signalements';

COMMENT ON POLICY "Sub-admins can view sector signalements" ON public.signalements IS 
'Sous-Admins DGSS/DGR (identifiés par metadata.role_type) voient les signalements de leur secteur';

COMMENT ON POLICY "Agents can view assigned signalements" ON public.signalements IS 
'Agents voient les signalements de leur ministère ou assignés via metadata.assigned_agent_id';

COMMENT ON POLICY "Users can view their own signalements" ON public.signalements IS 
'Citoyens voient uniquement leurs propres signalements pour confidentialité';