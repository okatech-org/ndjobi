-- Fonction pour s'assurer qu'un utilisateur démo a le bon rôle
CREATE OR REPLACE FUNCTION public.ensure_demo_user_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Supprimer les anciens rôles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Insérer le nouveau rôle
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Table pour les signalements
CREATE TABLE IF NOT EXISTS public.signalements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'incident', 'projet', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'rejected'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  location TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_signalements_user_id ON public.signalements(user_id);
CREATE INDEX IF NOT EXISTS idx_signalements_status ON public.signalements(status);
CREATE INDEX IF NOT EXISTS idx_signalements_type ON public.signalements(type);
CREATE INDEX IF NOT EXISTS idx_signalements_created_at ON public.signalements(created_at DESC);

-- RLS Policies pour signalements

-- Les utilisateurs peuvent voir leurs propres signalements
CREATE POLICY "Users can view their own signalements"
  ON public.signalements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer des signalements
CREATE POLICY "Users can create signalements"
  ON public.signalements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres signalements (seulement si pending)
CREATE POLICY "Users can update their own pending signalements"
  ON public.signalements
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Les agents peuvent voir tous les signalements
CREATE POLICY "Agents can view all signalements"
  ON public.signalements
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'agent') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Les agents peuvent mettre à jour tous les signalements
CREATE POLICY "Agents can update all signalements"
  ON public.signalements
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'agent') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Les admins peuvent supprimer des signalements
CREATE POLICY "Admins can delete signalements"
  ON public.signalements
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Trigger pour updated_at
CREATE TRIGGER update_signalements_updated_at
  BEFORE UPDATE ON public.signalements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table pour les projets protégés
CREATE TABLE IF NOT EXISTS public.projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'artistique', 'litteraire', 'logiciel', 'marque', etc.
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'protected', 'rejected'
  protection_type TEXT, -- 'copyright', 'trademark', 'patent', etc.
  files JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  protected_at TIMESTAMP WITH TIME ZONE,
  protection_number TEXT UNIQUE
);

-- Enable RLS
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_projets_user_id ON public.projets(user_id);
CREATE INDEX IF NOT EXISTS idx_projets_status ON public.projets(status);
CREATE INDEX IF NOT EXISTS idx_projets_category ON public.projets(category);
CREATE INDEX IF NOT EXISTS idx_projets_protection_number ON public.projets(protection_number);

-- RLS Policies pour projets

-- Les utilisateurs peuvent voir leurs propres projets
CREATE POLICY "Users can view their own projets"
  ON public.projets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer des projets
CREATE POLICY "Users can create projets"
  ON public.projets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres projets
CREATE POLICY "Users can update their own projets"
  ON public.projets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres projets (seulement si draft)
CREATE POLICY "Users can delete their own draft projets"
  ON public.projets
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- Les admins peuvent voir tous les projets
CREATE POLICY "Admins can view all projets"
  ON public.projets
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Les admins peuvent mettre à jour tous les projets
CREATE POLICY "Admins can update all projets"
  ON public.projets
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Trigger pour updated_at
CREATE TRIGGER update_projets_updated_at
  BEFORE UPDATE ON public.projets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();