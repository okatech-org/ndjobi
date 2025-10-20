-- ============================================
-- CRÉER LE COMPTE ADMIN COMPLET
-- Si le compte n'existe pas encore
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_admin_id UUID;
    v_admin_email TEXT := '24177888001@ndjobi.com';
    v_admin_phone TEXT := '+24177888001';
BEGIN
    -- Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        phone,
        phone_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        v_admin_email,
        crypt('111111', gen_salt('bf')),
        NOW(),
        v_admin_phone,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object(
            'full_name', 'Président de la République',
            'phone', v_admin_phone,
            'organization', 'Présidence de la République'
        ),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_admin_id;

    -- Si l'utilisateur existe déjà, récupérer son ID
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM auth.users WHERE email = v_admin_email;
    END IF;

    -- Créer le profil
    INSERT INTO public.profiles (id, email, full_name, phone, organization)
    VALUES (
        v_admin_id,
        v_admin_email,
        'Président de la République',
        v_admin_phone,
        'Présidence de la République'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        updated_at = NOW();

    -- Assigner le rôle admin (un seul!)
    DELETE FROM public.user_roles WHERE user_id = v_admin_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin'::app_role);

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS';
    RAISE NOTICE 'Email: %', v_admin_email;
    RAISE NOTICE 'Téléphone: %', v_admin_phone;
    RAISE NOTICE 'PIN: 111111';
    RAISE NOTICE 'ID: %', v_admin_id;
    RAISE NOTICE '========================================';
END $$;

-- Vérifier le résultat
SELECT 
    '✅ Vérification' as statut,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    p.organization,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888001@ndjobi.com';

