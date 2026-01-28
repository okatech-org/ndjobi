-- =====================================================
-- Trigger et politiques RLS pour agents spécialisés
-- =====================================================

-- Créer la fonction de routage automatique (si pas déjà créée)
CREATE OR REPLACE FUNCTION public.auto_assign_agent_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.assigned_agent_role := CASE NEW.type
    WHEN 'corruption' THEN 'agent_anticorruption'
    WHEN 'detournement' THEN 'agent_anticorruption'
    WHEN 'abus_pouvoir' THEN 'agent_justice'
    WHEN 'fraude' THEN 'agent_justice'
    WHEN 'extorsion' THEN 'agent_interior'
    WHEN 'favoritisme' THEN 'agent_interior'
    WHEN 'defense' THEN 'agent_defense'
    WHEN 'securite' THEN 'sub_admin_dgss'
    WHEN 'renseignement' THEN 'sub_admin_dgr'
    ELSE 'agent_interior'
  END;
  RETURN NEW;
END;
$$;

-- Créer le trigger pour l'assignation automatique
DROP TRIGGER IF EXISTS trigger_auto_assign_agent_role ON public.signalements;
CREATE TRIGGER trigger_auto_assign_agent_role
  BEFORE INSERT ON public.signalements
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_agent_role();

-- Fonction helper pour vérifier le rôle d'agent spécialisé
CREATE OR REPLACE FUNCTION public.get_user_agent_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role::text IN ('agent_anticorruption', 'agent_justice', 
                       'agent_interior', 'agent_defense',
                       'sub_admin_dgss', 'sub_admin_dgr')
  LIMIT 1;
$$;

-- Supprimer les anciennes politiques des agents
DROP POLICY IF EXISTS "Agents can view assigned signalements" ON public.signalements;
DROP POLICY IF EXISTS "Specialized agents can view assigned signalements" ON public.signalements;
DROP POLICY IF EXISTS "Specialized agents can update assigned signalements" ON public.signalements;

-- Nouvelle politique: agents spécialisés voient les signalements assignés à leur rôle
CREATE POLICY "Specialized agents can view assigned signalements"
ON public.signalements FOR SELECT
USING (
  get_user_agent_role(auth.uid()) = assigned_agent_role
);

-- Politique pour que les agents spécialisés puissent mettre à jour leurs signalements
CREATE POLICY "Specialized agents can update assigned signalements"
ON public.signalements FOR UPDATE
USING (
  get_user_agent_role(auth.uid()) = assigned_agent_role
);