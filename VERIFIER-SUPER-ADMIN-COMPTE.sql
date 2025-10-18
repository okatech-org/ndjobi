-- Script pour vérifier l'existence du compte Super Admin
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- VÉRIFICATION DU COMPTE SUPER ADMIN
-- =====================================================

-- Vérifier dans auth.users
SELECT 
    'Vérification auth.users' as section,
    id,
    email,
    phone,
    created_at
FROM auth.users 
WHERE email = '33661002616@ndjobi.com' 
   OR phone = '+33661002616'
   OR email = 'superadmin@ndjobi.com';

-- Vérifier dans public.profiles
SELECT 
    'Vérification public.profiles' as section,
    id,
    email,
    full_name,
    phone,
    created_at
FROM public.profiles 
WHERE email = '33661002616@ndjobi.com' 
   OR phone = '+33661002616'
   OR email = 'superadmin@ndjobi.com';

-- Vérifier dans public.user_roles
SELECT 
    'Vérification public.user_roles' as section,
    ur.user_id,
    ur.role,
    p.email,
    p.full_name
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email = '33661002616@ndjobi.com' 
   OR p.phone = '+33661002616'
   OR p.email = 'superadmin@ndjobi.com';

-- Vérifier tous les comptes avec rôle super_admin
SELECT 
    'Tous les comptes super_admin' as section,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'super_admin';

-- Vérifier tous les comptes créés récemment
SELECT 
    'Comptes créés récemment' as section,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.created_at >= NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;
