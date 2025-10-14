-- ============================================
-- SCRIPT DE RÉPARATION DES COMPTES DÉMO
-- ============================================
-- Exécuter dans Supabase Studio SQL Editor
-- http://127.0.0.1:54323/project/default/editor

-- 1. Créer la fonction RPC pour assigner les rôles (si elle n'existe pas)
CREATE OR REPLACE FUNCTION public.ensure_demo_user_role(
  _user_id UUID,
  _role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer l'ancien rôle s'il existe
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Ajouter le nouveau rôle
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_user_id, _role);
  
  -- Créer/mettre à jour le profil
  INSERT INTO public.profiles (id, username, email)
  SELECT _user_id, 
         CASE _role
           WHEN 'super_admin' THEN 'Super Admin'
           WHEN 'admin' THEN 'Admin'
           WHEN 'agent' THEN 'Agent DGSS'
           ELSE 'Citoyen'
         END,
         email
  FROM auth.users 
  WHERE id = _user_id
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username;
END;
$$;

-- 2. Donner les permissions sur la fonction
GRANT EXECUTE ON FUNCTION public.ensure_demo_user_role TO anon, authenticated;

-- 3. Assigner les rôles aux comptes existants
DO $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Super Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777000@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin');
    
    INSERT INTO public.profiles (id, username, email)
    VALUES (v_user_id, 'Super Admin', '24177777000@ndjobi.ga')
    ON CONFLICT (id) DO UPDATE SET username = 'Super Admin';
    
    v_count := v_count + 1;
    RAISE NOTICE '✅ Super Admin configuré (ID: %)', v_user_id;
  ELSE
    RAISE NOTICE '❌ Super Admin non trouvé - créez-le via l''interface';
  END IF;

  -- Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777003@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
    
    INSERT INTO public.profiles (id, username, email)
    VALUES (v_user_id, 'Protocole État', '24177777003@ndjobi.ga')
    ON CONFLICT (id) DO UPDATE SET username = 'Protocole État';
    
    v_count := v_count + 1;
    RAISE NOTICE '✅ Admin configuré (ID: %)', v_user_id;
  END IF;

  -- Agent
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777002@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'agent');
    
    INSERT INTO public.profiles (id, username, email)
    VALUES (v_user_id, 'Agent DGSS', '24177777002@ndjobi.ga')
    ON CONFLICT (id) DO UPDATE SET username = 'Agent DGSS';
    
    v_count := v_count + 1;
    RAISE NOTICE '✅ Agent configuré (ID: %)', v_user_id;
  END IF;

  -- Citoyen
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777001@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'user');
    
    INSERT INTO public.profiles (id, username, email)
    VALUES (v_user_id, 'Citoyen', '24177777001@ndjobi.ga')
    ON CONFLICT (id) DO UPDATE SET username = 'Citoyen';
    
    v_count := v_count + 1;
    RAISE NOTICE '✅ Citoyen configuré (ID: %)', v_user_id;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Total : % comptes configurés', v_count;
  RAISE NOTICE '================================';
END $$;

-- 4. Vérifier les comptes créés
SELECT 
  u.id,
  u.email,
  COALESCE(ur.role, 'non assigné') as role,
  COALESCE(p.username, 'Sans nom') as username,
  CASE 
    WHEN ur.role = 'super_admin' THEN '✅ Accès complet'
    WHEN ur.role = 'admin' THEN '✅ Accès admin'
    WHEN ur.role = 'agent' THEN '✅ Accès agent'
    WHEN ur.role = 'user' THEN '✅ Accès citoyen'
    ELSE '❌ Rôle non configuré'
  END as statut
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@ndjobi.ga'
ORDER BY 
  CASE ur.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'agent' THEN 3
    WHEN 'user' THEN 4
    ELSE 5
  END;
