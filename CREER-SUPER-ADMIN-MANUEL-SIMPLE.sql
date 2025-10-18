-- Script simple pour créer le compte Super Admin
-- À exécuter manuellement dans le SQL Editor de Supabase

-- Désactiver temporairement RLS pour les tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Créer le compte Super Admin
DO $$
DECLARE
    v_super_admin_id uuid;
    v_phone TEXT := '+33661002616';
    v_email TEXT := '33661002616@ndjobi.com';
    v_pin TEXT := '999999';
BEGIN
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
    );

    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (v_super_admin_id, 'super_admin', NOW());

    RAISE NOTICE '✅ Compte Super Admin créé avec succès !';
    RAISE NOTICE 'ID: %', v_super_admin_id;
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE 'Téléphone: %', v_phone;
    RAISE NOTICE 'PIN: %', v_pin;

END $$;

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Vérification finale
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
