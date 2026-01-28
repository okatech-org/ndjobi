-- =====================================================
-- Ajout colonne assigned_agent_role
-- =====================================================

-- Ajouter la colonne assigned_agent_role à signalements
ALTER TABLE public.signalements 
ADD COLUMN IF NOT EXISTS assigned_agent_role text;

-- Créer un index pour optimiser les requêtes par rôle assigné
CREATE INDEX IF NOT EXISTS idx_signalements_assigned_agent_role 
ON public.signalements (assigned_agent_role);

-- Mettre à jour les signalements existants avec le rôle approprié
UPDATE public.signalements SET assigned_agent_role = CASE type
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
END
WHERE assigned_agent_role IS NULL;