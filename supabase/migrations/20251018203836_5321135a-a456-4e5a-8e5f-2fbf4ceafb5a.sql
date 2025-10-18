-- =====================================================
-- CRÉATION COMPLÈTE DU COMPTE SUPER ADMIN
-- Email: 33661002616@ndjobi.com
-- Téléphone: +33661002616
-- PIN: 999999
-- =====================================================

DO $$
DECLARE
    v_user_id uuid;
    v_email TEXT := '33661002616@ndjobi.com';
    v_phone TEXT := '+33661002616';
    v_pin TEXT := '999999';
    v_encrypted_password TEXT;
BEGIN
    -- Désactiver temporairement RLS
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

    -- Vérifier si l'utilisateur existe dans auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    -- Si l'utilisateur n'existe pas, le créer
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Création du compte Super Admin dans auth.users...';
        
        -- Générer le hash bcrypt pour le PIN
        v_encrypted_password := crypt(v_pin, gen_salt('bf'));
        
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
            v_encrypted_password,
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}'::jsonb,
            jsonb_build_object(
                'full_name', 'Super Administrateur',
                'phone', v_phone,
                'organization', 'Administration Système'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_user_id;

        RAISE NOTICE '✅ Compte créé dans auth.users avec ID: %', v_user_id;
    ELSE
        RAISE NOTICE '⚠️ Compte existe déjà dans auth.users avec ID: %', v_user_id;
    END IF;

    -- Créer/Mettre à jour le profil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        organization,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
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

    RAISE NOTICE '✅ Profil créé/mis à jour';

    -- Supprimer les anciens rôles pour cet utilisateur
    DELETE FROM public.user_roles WHERE user_id = v_user_id;

    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at
    ) VALUES (
        v_user_id,
        'super_admin',
        NOW()
    );

    RAISE NOTICE '✅ Rôle super_admin attribué';

    -- Réactiver RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 Compte Super Admin configuré avec succès!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE 'Téléphone: %', v_phone;
    RAISE NOTICE 'PIN: %', v_pin;
    RAISE NOTICE 'URL de connexion: /auth/super-admin';
    RAISE NOTICE '========================================';

END $$;