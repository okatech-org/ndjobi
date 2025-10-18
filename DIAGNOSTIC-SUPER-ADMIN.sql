-- Script de diagnostic pour le compte Super Admin
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- DIAGNOSTIC COMPLET DU COMPTE SUPER ADMIN
-- =====================================================

-- 1. Vérifier tous les comptes avec le numéro de téléphone
SELECT 
    '1. Recherche par téléphone +33661002616' as test,
    u.id,
    u.email,
    u.phone,
    u.created_at
FROM auth.users u
WHERE u.phone = '+33661002616' 
   OR u.email LIKE '%33661002616%'
   OR u.email = 'superadmin@ndjobi.com';

-- 2. Vérifier tous les profils avec le numéro de téléphone
SELECT 
    '2. Recherche dans profiles par téléphone' as test,
    p.id,
    p.email,
    p.phone,
    p.full_name,
    p.created_at
FROM public.profiles p
WHERE p.phone = '+33661002616' 
   OR p.email LIKE '%33661002616%'
   OR p.email = 'superadmin@ndjobi.com';

-- 3. Vérifier tous les rôles super_admin
SELECT 
    '3. Tous les comptes super_admin' as test,
    ur.user_id,
    ur.role,
    p.email,
    p.full_name,
    p.phone
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE ur.role = 'super_admin';

-- 4. Vérifier tous les comptes créés récemment
SELECT 
    '4. Comptes créés récemment' as test,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY u.created_at DESC;

-- 5. Vérifier la structure des tables
SELECT 
    '5. Vérification structure table profiles' as test,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Compter tous les utilisateurs
SELECT 
    '6. Nombre total d\'utilisateurs' as test,
    COUNT(*) as total_users
FROM auth.users;

-- 7. Compter tous les profils
SELECT 
    '7. Nombre total de profils' as test,
    COUNT(*) as total_profiles
FROM public.profiles;

-- 8. Recherche par email exact
SELECT 
    '8. Recherche email exact 33661002616@ndjobi.com' as test,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';

-- 9. Vérifier les politiques RLS
SELECT 
    '9. Politiques RLS sur profiles' as test,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 10. Test de création simple
SELECT 
    '10. Test insertion directe' as test,
    'Prêt pour création manuelle' as status;
