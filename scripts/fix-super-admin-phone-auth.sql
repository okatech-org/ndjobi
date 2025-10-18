-- =====================================================
-- Script pour configurer le Super Admin avec téléphone
-- Authentification SMS/OTP au lieu d'email
-- =====================================================

BEGIN;

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Trouver l'ID de l'utilisateur superadmin@ndjobi.com
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'superadmin@ndjobi.com';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilisateur superadmin@ndjobi.com non trouvé';
    END IF;
    
    -- Mettre à jour le profil avec le numéro de téléphone
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
        v_user_id,
        'superadmin@ndjobi.com',
        'Super Administrateur',
        '+33661002616',  -- Numéro pour l'authentification SMS
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';
    
    RAISE NOTICE '✅ Compte Super Admin configuré avec téléphone !';
    RAISE NOTICE 'Email: superadmin@ndjobi.com';
    RAISE NOTICE 'Téléphone: +33661002616';
    RAISE NOTICE 'Code OTP: 999999';
    RAISE NOTICE 'Authentification: SMS/OTP';
    
END $$;

COMMIT;

-- Vérification finale
SELECT 
    u.id,
    u.email,
    u.phone,
    u.email_confirmed_at,
    p.full_name,
    p.phone as profile_phone,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'superadmin@ndjobi.com';
