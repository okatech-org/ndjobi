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