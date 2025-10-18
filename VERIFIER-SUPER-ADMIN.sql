-- Script pour vérifier si le compte Super Admin existe
-- À exécuter dans le SQL Editor de Supabase

-- Vérifier dans auth.users
SELECT 
    'auth.users' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = '33661002616@ndjobi.com') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status,
    COUNT(*) as count
FROM auth.users 
WHERE email = '33661002616@ndjobi.com';

-- Vérifier dans public.profiles
SELECT 
    'public.profiles' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.profiles WHERE email = '33661002616@ndjobi.com') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status,
    COUNT(*) as count
FROM public.profiles 
WHERE email = '33661002616@ndjobi.com';

-- Vérifier dans public.user_roles
SELECT 
    'public.user_roles' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN auth.users u ON ur.user_id = u.id
            WHERE u.email = '33661002616@ndjobi.com' 
            AND ur.role = 'super_admin'
        ) 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status,
    COUNT(*) as count
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = '33661002616@ndjobi.com' 
AND ur.role = 'super_admin';

-- Affichage détaillé si le compte existe
SELECT 
    u.id,
    u.email,
    u.phone,
    u.created_at as user_created,
    p.full_name,
    p.organization,
    p.created_at as profile_created,
    ur.role,
    ur.created_at as role_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
