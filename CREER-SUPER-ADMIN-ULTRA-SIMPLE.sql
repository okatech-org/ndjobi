-- Script ultra-simple pour créer le compte Super Admin
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- CRÉATION ULTRA-SIMPLE DU COMPTE SUPER ADMIN
-- =====================================================

-- Étape 1: Désactiver temporairement RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Étape 2: Créer le compte dans auth.users
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
    '{"full_name":"Super Administrateur","phone":"+33661002616","organization":"Administration Système"}',
    NOW(),
    NOW(),
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Étape 3: Récupérer l'ID du compte créé
WITH super_admin_user AS (
    SELECT id FROM auth.users WHERE email = '33661002616@ndjobi.com'
)
INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
SELECT 
    id,
    '33661002616@ndjobi.com',
    'Super Administrateur',
    '+33661002616',
    'Administration Système',
    NOW(),
    NOW()
FROM super_admin_user
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    organization = EXCLUDED.organization,
    updated_at = NOW();

-- Étape 4: Attribuer le rôle super_admin
WITH super_admin_user AS (
    SELECT id FROM auth.users WHERE email = '33661002616@ndjobi.com'
)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    id,
    'super_admin',
    NOW()
FROM super_admin_user
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Étape 5: Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Étape 6: Vérification finale
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
