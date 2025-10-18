-- Script de test pour vérifier les nouveaux comptes démo
-- À exécuter dans le SQL Editor de Supabase

RAISE NOTICE '--- Test des nouveaux comptes démo ---';

-- Vérifier tous les comptes démo créés
SELECT 
    'Vérification des comptes démo' as status,
    ur.role AS "Rôle",
    p.full_name AS "Nom",
    p.phone AS "Téléphone",
    p.organization AS "Organisation",
    u.email AS "Email",
    u.created_at AS "Date création"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com'
ORDER BY 
    CASE ur.role
        WHEN 'admin' THEN 1
        WHEN 'sub_admin' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'user' THEN 4
    END,
    p.organization;

-- Vérifier le compte Super Admin
SELECT 
    'Vérification Super Admin' as status,
    u.email AS "Email",
    p.full_name AS "Nom",
    ur.role AS "Rôle",
    u.created_at AS "Date création"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';

-- Compter les comptes par rôle
SELECT 
    'Comptage par rôle' as status,
    ur.role AS "Rôle",
    COUNT(*) AS "Nombre de comptes"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com'
GROUP BY ur.role
ORDER BY 
    CASE ur.role
        WHEN 'admin' THEN 1
        WHEN 'sub_admin' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'user' THEN 4
    END;

RAISE NOTICE '--- Test terminé ---';
