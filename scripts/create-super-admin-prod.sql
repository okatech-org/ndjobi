-- ============================================
-- Script SQL pour créer le compte Super Admin pour la production
-- Email: superadmin@ndjobi.com
-- Code: 019183
-- ============================================

-- IMPORTANT: Ce script doit être exécuté manuellement via l'interface Supabase
-- Ou vous devez créer le compte via l'interface d'authentification de l'application

-- Étape 1: Créer l'utilisateur manuellement via l'interface /auth avec:
--   - Email: superadmin@ndjobi.com
--   - Password: JEhsKL/H3I1yxawEUeHp1w==
--   - Ou utiliser n'importe quel compte existant et le promouvoir

-- Étape 2: Exécuter ce script pour promouvoir l'utilisateur

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'superadmin@ndjobi.com';
BEGIN
  -- Trouver l'utilisateur par email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Supprimer tous les rôles existants pour cet utilisateur
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Assigner le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Mettre à jour le profil
    UPDATE public.profiles 
    SET username = 'Super Admin'
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ SUCCESS: User % (%) est maintenant SUPER ADMIN', v_email, v_user_id;
  ELSE
    RAISE NOTICE '❌ ERREUR: Utilisateur % non trouvé. Créez d''abord le compte via /auth', v_email;
    RAISE NOTICE 'Instructions:';
    RAISE NOTICE '1. Aller sur https://votre-url.lovable.app/auth';
    RAISE NOTICE '2. Créer un compte avec email: %', v_email;
    RAISE NOTICE '3. Utiliser le mot de passe: JEhsKL/H3I1yxawEUeHp1w==';
    RAISE NOTICE '4. Exécuter à nouveau ce script';
  END IF;
END $$;

-- Vérification finale: Afficher tous les super admins
SELECT 
  u.email,
  p.username,
  ur.role,
  u.created_at,
  u.id as user_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'super_admin'
ORDER BY u.created_at DESC;

