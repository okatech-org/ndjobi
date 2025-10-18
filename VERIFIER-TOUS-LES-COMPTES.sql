-- Script de vérification de tous les comptes créés
-- À exécuter dans le SQL Editor de Supabase après la création

-- =====================================================
-- VÉRIFICATION COMPLÈTE DE TOUS LES COMPTES
-- =====================================================

SELECT 
    'Vérification complète des comptes NDJOBI' as titre,
    COUNT(*) as total_comptes
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com';

-- =====================================================
-- DÉTAIL DE TOUS LES COMPTES PAR RÔLE
-- =====================================================

SELECT 
    ur.role AS "Rôle",
    p.full_name AS "Nom",
    p.phone AS "Téléphone",
    p.organization AS "Organisation",
    u.email AS "Email",
    u.created_at AS "Date création",
    CASE 
        WHEN ur.role = 'admin' THEN '✅ Président/Administrateur'
        WHEN ur.role = 'sub_admin' THEN '✅ Sous-Administrateur'
        WHEN ur.role = 'agent' THEN '✅ Agent Ministériel'
        WHEN ur.role = 'user' THEN '✅ Utilisateur Citoyen'
        ELSE '❓ Rôle inconnu'
    END AS "Statut"
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

-- =====================================================
-- VÉRIFICATION PAR RÔLE
-- =====================================================

SELECT 
    'admin' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888001@ndjobi.com' AND ur.role = 'admin') 
        THEN '✅ Admin (Président) créé' 
        ELSE '❌ Admin (Président) manquant' 
    END as statut
UNION ALL
SELECT 
    'sub_admin' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888002@ndjobi.com' AND ur.role = 'sub_admin') 
        THEN '✅ Sous-Admin DGSS créé' 
        ELSE '❌ Sous-Admin DGSS manquant' 
    END as statut
UNION ALL
SELECT 
    'sub_admin' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888003@ndjobi.com' AND ur.role = 'sub_admin') 
        THEN '✅ Sous-Admin DGR créé' 
        ELSE '❌ Sous-Admin DGR manquant' 
    END as statut
UNION ALL
SELECT 
    'agent' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888004@ndjobi.com' AND ur.role = 'agent') 
        THEN '✅ Agent Défense créé' 
        ELSE '❌ Agent Défense manquant' 
    END as statut
UNION ALL
SELECT 
    'agent' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888005@ndjobi.com' AND ur.role = 'agent') 
        THEN '✅ Agent Justice créé' 
        ELSE '❌ Agent Justice manquant' 
    END as statut
UNION ALL
SELECT 
    'agent' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888006@ndjobi.com' AND ur.role = 'agent') 
        THEN '✅ Agent Anti-Corruption créé' 
        ELSE '❌ Agent Anti-Corruption manquant' 
    END as statut
UNION ALL
SELECT 
    'agent' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888007@ndjobi.com' AND ur.role = 'agent') 
        THEN '✅ Agent Intérieur créé' 
        ELSE '❌ Agent Intérieur manquant' 
    END as statut
UNION ALL
SELECT 
    'user' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888008@ndjobi.com' AND ur.role = 'user') 
        THEN '✅ Citoyen Démo créé' 
        ELSE '❌ Citoyen Démo manquant' 
    END as statut
UNION ALL
SELECT 
    'user' as role_attendu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = '24177888009@ndjobi.com' AND ur.role = 'user') 
        THEN '✅ Citoyen Anonyme créé' 
        ELSE '❌ Citoyen Anonyme manquant' 
    END as statut;

-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================

SELECT 
    'RÉSUMÉ FINAL' as titre,
    COUNT(CASE WHEN ur.role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN ur.role = 'sub_admin' THEN 1 END) as sous_admins,
    COUNT(CASE WHEN ur.role = 'agent' THEN 1 END) as agents,
    COUNT(CASE WHEN ur.role = 'user' THEN 1 END) as users,
    COUNT(*) as total
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com';
