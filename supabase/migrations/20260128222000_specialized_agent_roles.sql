-- Migration: Add specialized agent roles and signalement routing
-- Cette migration ajoute les rôles spécialisés pour le traitement des signalements

-- 1. Ajouter les nouveaux rôles à l'enum app_role
-- Note: Les valeurs enum doivent être ajoutées une par une
DO $$ 
BEGIN
  -- Vérifier si les valeurs existent déjà avant de les ajouter
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sub_admin_dgss' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'sub_admin_dgss';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sub_admin_dgr' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'sub_admin_dgr';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agent_defense' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'agent_defense';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agent_justice' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'agent_justice';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agent_interior' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'agent_interior';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agent_anticorruption' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'agent_anticorruption';
  END IF;
END $$;

-- 2. Ajouter la colonne assigned_agent_role pour le routage automatique
ALTER TABLE public.signalements 
ADD COLUMN IF NOT EXISTS assigned_agent_role TEXT;

-- 3. Créer la fonction de routage automatique des signalements
CREATE OR REPLACE FUNCTION public.route_signalement_to_agent()
RETURNS TRIGGER AS $$
BEGIN
  -- Routage basé sur le type de signalement
  NEW.assigned_agent_role := CASE NEW.type
    WHEN 'corruption' THEN 'agent_anticorruption'
    WHEN 'detournement' THEN 'agent_anticorruption'
    WHEN 'extorsion' THEN 'agent_interior'
    WHEN 'abus_pouvoir' THEN 'agent_justice'
    WHEN 'favoritisme' THEN 'agent_interior'
    WHEN 'fraude' THEN 'agent_justice'
    WHEN 'defense' THEN 'agent_defense'
    WHEN 'securite' THEN 'sub_admin_dgss'
    WHEN 'renseignement' THEN 'sub_admin_dgr'
    ELSE 'agent_interior' -- Par défaut
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger pour le routage automatique
DROP TRIGGER IF EXISTS trigger_route_signalement ON public.signalements;
CREATE TRIGGER trigger_route_signalement
  BEFORE INSERT ON public.signalements
  FOR EACH ROW
  EXECUTE FUNCTION public.route_signalement_to_agent();

-- 5. Mettre à jour les signalements existants
UPDATE public.signalements
SET assigned_agent_role = CASE type
  WHEN 'corruption' THEN 'agent_anticorruption'
  WHEN 'detournement' THEN 'agent_anticorruption'
  WHEN 'extorsion' THEN 'agent_interior'
  WHEN 'abus_pouvoir' THEN 'agent_justice'
  WHEN 'favoritisme' THEN 'agent_interior'
  WHEN 'fraude' THEN 'agent_justice'
  ELSE 'agent_interior'
END
WHERE assigned_agent_role IS NULL;

-- 6. Mettre à jour les politiques RLS pour les agents spécialisés
-- Politique: Les agents spécialisés peuvent voir les signalements de leur domaine
DROP POLICY IF EXISTS "Specialized agents can view assigned signalements" ON public.signalements;
CREATE POLICY "Specialized agents can view assigned signalements"
  ON public.signalements
  FOR SELECT
  USING (
    -- Agent Anti-Corruption voit corruption et détournement
    (has_role(auth.uid(), 'agent_anticorruption') AND assigned_agent_role = 'agent_anticorruption')
    OR
    -- Agent Justice voit abus de pouvoir et fraude
    (has_role(auth.uid(), 'agent_justice') AND assigned_agent_role = 'agent_justice')
    OR
    -- Agent Intérieur voit extorsion, favoritisme et autres
    (has_role(auth.uid(), 'agent_interior') AND assigned_agent_role = 'agent_interior')
    OR
    -- Agent Défense voit les signalements de défense
    (has_role(auth.uid(), 'agent_defense') AND assigned_agent_role = 'agent_defense')
    OR
    -- Sous-Admin DGSS voit les signalements de sécurité
    (has_role(auth.uid(), 'sub_admin_dgss') AND assigned_agent_role = 'sub_admin_dgss')
    OR
    -- Sous-Admin DGR voit les signalements de renseignement
    (has_role(auth.uid(), 'sub_admin_dgr') AND assigned_agent_role = 'sub_admin_dgr')
  );

-- Les agents spécialisés peuvent mettre à jour les signalements de leur domaine
DROP POLICY IF EXISTS "Specialized agents can update assigned signalements" ON public.signalements;
CREATE POLICY "Specialized agents can update assigned signalements"
  ON public.signalements
  FOR UPDATE
  USING (
    (has_role(auth.uid(), 'agent_anticorruption') AND assigned_agent_role = 'agent_anticorruption')
    OR (has_role(auth.uid(), 'agent_justice') AND assigned_agent_role = 'agent_justice')
    OR (has_role(auth.uid(), 'agent_interior') AND assigned_agent_role = 'agent_interior')
    OR (has_role(auth.uid(), 'agent_defense') AND assigned_agent_role = 'agent_defense')
    OR (has_role(auth.uid(), 'sub_admin_dgss') AND assigned_agent_role = 'sub_admin_dgss')
    OR (has_role(auth.uid(), 'sub_admin_dgr') AND assigned_agent_role = 'sub_admin_dgr')
  );

-- 7. Index pour performance
CREATE INDEX IF NOT EXISTS idx_signalements_assigned_agent_role 
ON public.signalements(assigned_agent_role);
