-- Script simple pour créer le compte Super Admin
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer l'utilisateur dans auth.users
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
    '33661002616@ndjobi.com',
    crypt('999999', gen_salt('bf')),
    NOW(),
    '+33661002616',
    NOW(),
    '{"provider":"phone","providers":["phone"]}',
    jsonb_build_object(
        'full_name', 'Super Administrateur',
        'phone', '+33661002616',
        'organization', 'NDJOBI Platform'
    ),
    NOW(),
    NOW(),
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Créer le profil dans public.profiles
INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
SELECT 
    u.id,
    '33661002616@ndjobi.com',
    'Super Administrateur',
    '+33661002616',
    'NDJOBI Platform',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    organization = EXCLUDED.organization,
    updated_at = NOW();

-- 3. Assigner le rôle super_admin
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    u.id,
    'super_admin',
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin';

-- 4. Vérification finale
SELECT 
    'Vérification compte Super Admin' as status,
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
