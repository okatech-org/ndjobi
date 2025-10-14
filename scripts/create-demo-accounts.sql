-- ============================================
-- Script pour créer les comptes démo NDJOBI
-- ============================================

-- Fonction pour créer un utilisateur démo s'il n'existe pas
CREATE OR REPLACE FUNCTION create_demo_account(
  demo_email TEXT,
  demo_password TEXT,
  demo_role TEXT,
  demo_name TEXT
) RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO user_id FROM auth.users WHERE email = demo_email;
  
  IF user_id IS NULL THEN
    -- Note: La création directe via SQL n'est pas possible,
    -- elle doit se faire via l'API Supabase Auth
    RAISE NOTICE 'User % needs to be created via Auth API', demo_email;
  ELSE
    -- L'utilisateur existe, assigner le rôle
    DELETE FROM public.user_roles WHERE user_id = user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (user_id, demo_role);
    
    -- Mettre à jour le profil
    INSERT INTO public.profiles (id, username, email)
    VALUES (user_id, demo_name, demo_email)
    ON CONFLICT (id) DO UPDATE
    SET username = demo_name;
    
    RAISE NOTICE 'Demo account % configured with role %', demo_email, demo_role;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Créer les comptes démo
SELECT create_demo_account('24177777001@ndjobi.ga', '123456', 'user', 'Citoyen');
SELECT create_demo_account('24177777002@ndjobi.ga', '123456', 'agent', 'Agent DGSS');
SELECT create_demo_account('24177777003@ndjobi.ga', '123456', 'admin', 'Protocole État');
SELECT create_demo_account('24177777000@ndjobi.ga', '123456', 'super_admin', 'Super Admin');

-- Afficher les comptes créés
SELECT 
  u.email,
  p.username,
  ur.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '%@ndjobi.ga'
ORDER BY ur.role DESC;
