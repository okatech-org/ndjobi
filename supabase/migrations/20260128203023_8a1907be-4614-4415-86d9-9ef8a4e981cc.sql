-- 1. Rendre user_id nullable pour les signalements anonymes
ALTER TABLE public.signalements 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Supprimer l'ancienne politique d'insertion si elle existe
DROP POLICY IF EXISTS "Users can create signalements" ON public.signalements;
DROP POLICY IF EXISTS "Anyone can create signalements" ON public.signalements;

-- 3. Créer une politique permettant à tout le monde de créer des signalements (anonymes ou non)
CREATE POLICY "Anyone can create signalements"
  ON public.signalements
  FOR INSERT
  WITH CHECK (true);

-- 4. Mettre à jour la politique des agents pour inclure les signalements anonymes
DROP POLICY IF EXISTS "Agents can view assigned signalements" ON public.signalements;
CREATE POLICY "Agents can view assigned signalements"
  ON public.signalements
  FOR SELECT
  USING (
    has_role(auth.uid(), 'agent'::app_role) 
    AND (
      user_id IS NULL  -- Signalements anonymes
      OR (metadata ->> 'assigned_agent_id')::text = auth.uid()::text
      OR (metadata ->> 'ministry')::text = (
        SELECT (profiles.metadata ->> 'ministry')::text
        FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );