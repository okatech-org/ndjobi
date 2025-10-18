-- Script pour créer le compte Super Admin
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- CRÉATION DU COMPTE SUPER ADMIN
-- =====================================================

DO $$
DECLARE
    v_super_admin_id uuid;
    v_phone TEXT := '+33661002616';
    v_email TEXT := '33661002616@ndjobi.com';
    v_pin TEXT := '999999';
BEGIN
    -- Vérifier si le compte existe déjà
    SELECT id INTO v_super_admin_id
    FROM auth.users
    WHERE email = v_email;

    IF v_super_admin_id IS NULL THEN
        -- Créer le compte dans auth.users
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
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_pin, gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Super Administrateur',
                'phone', v_phone,
                'organization', 'Administration Système'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_super_admin_id;

        RAISE NOTICE '✅ Compte Super Admin créé dans auth.users avec ID: %', v_super_admin_id;
    ELSE
        RAISE NOTICE '⚠️  Compte Super Admin existe déjà avec ID: %', v_super_admin_id;
    END IF;

    -- Créer le profil dans public.profiles
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
    VALUES (
        v_super_admin_id,
        v_email,
        'Super Administrateur',
        v_phone,
        'Administration Système',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        updated_at = NOW();

    RAISE NOTICE '✅ Profil Super Admin créé/mis à jour dans public.profiles';

    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (v_super_admin_id, 'super_admin', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';

    RAISE NOTICE '✅ Rôle super_admin attribué dans public.user_roles';

    -- Vérification finale
    SELECT 
        u.id,
        u.email,
        u.phone,
        p.full_name,
        ur.role
    INTO v_super_admin_id, v_email, v_phone
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE u.email = '33661002616@ndjobi.com';

    IF v_super_admin_id IS NOT NULL THEN
        RAISE NOTICE '🎉 COMPTE SUPER ADMIN CONFIGURÉ AVEC SUCCÈS !';
        RAISE NOTICE 'Email: 33661002616@ndjobi.com';
        RAISE NOTICE 'Téléphone: +33661002616';
        RAISE NOTICE 'PIN: 999999';
        RAISE NOTICE 'Rôle: super_admin';
    ELSE
        RAISE EXCEPTION '❌ Erreur lors de la création du compte Super Admin';
    END IF;

END $$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

SELECT 
    'VÉRIFICATION FINALE' as status,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
