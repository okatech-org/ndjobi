-- =====================================================
-- Script pour créer le compte Super Admin NDJOBI
-- =====================================================
-- Email: superadmin@ndjobi.com
-- Password: ChangeMeStrong!123
-- Code OTP: 999999
--
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase
-- =====================================================

BEGIN;

-- 1. Vérifier si le compte existe déjà
DO $$
DECLARE
    v_user_id uuid;
    v_user_exists boolean;
BEGIN
    -- Chercher l'utilisateur par email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'superadmin@ndjobi.com';
    
    v_user_exists := FOUND;
    
    IF NOT v_user_exists THEN
        RAISE NOTICE 'Le compte Super Admin n''existe pas encore.';
        RAISE NOTICE 'Veuillez créer le compte via l''interface web d''abord:';
        RAISE NOTICE '1. Aller sur https://xfxqwlbqysiezqdpeqpv.supabase.co/project/xfxqwlbqysiezqdpeqpv/auth/users';
        RAISE NOTICE '2. Cliquer sur "Add user"';
        RAISE NOTICE '3. Email: superadmin@ndjobi.com';
        RAISE NOTICE '4. Password: ChangeMeStrong!123';
        RAISE NOTICE '5. Confirmer l''email automatiquement';
        RAISE EXCEPTION 'Compte non trouvé. Arrêt du script.';
    END IF;
    
    RAISE NOTICE 'Compte Super Admin trouvé: %', v_user_id;
    
    -- 2. Créer ou mettre à jour le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
        v_user_id,
        'superadmin@ndjobi.com',
        'Super Administrateur',
        '+33661002616',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    RAISE NOTICE 'Profil créé/mis à jour pour %', v_user_id;
    
    -- 3. Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';
    
    RAISE NOTICE 'Rôle super_admin attribué à %', v_user_id;
    
    -- 4. Vérification finale
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Compte Super Admin configuré avec succès!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Email: superadmin@ndjobi.com';
    RAISE NOTICE 'Password: ChangeMeStrong!123';
    RAISE NOTICE 'Code OTP: 999999';
    RAISE NOTICE '==============================================';
    
END $$;

COMMIT;

-- Vérification finale
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    p.full_name,
    p.phone,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'superadmin@ndjobi.com';

