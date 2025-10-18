-- Script de test pour vérifier la configuration du compte anonyme
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- TEST 1: VÉRIFICATION DU COMPTE ANONYME
-- =====================================================

SELECT 
    'TEST 1: Vérification compte anonyme' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            JOIN public.profiles p ON u.id = p.id
            JOIN public.user_roles ur ON u.id = ur.user_id
            WHERE u.email = '24177888009@ndjobi.com' 
            AND ur.role = 'user'
        ) THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END as result;

-- =====================================================
-- TEST 2: VÉRIFICATION DU COMPTE DÉMO
-- =====================================================

SELECT 
    'TEST 2: Vérification compte démo' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            JOIN public.profiles p ON u.id = p.id
            JOIN public.user_roles ur ON u.id = ur.user_id
            WHERE u.email = '24177888008@ndjobi.com' 
            AND ur.role = 'user'
        ) THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END as result;

-- =====================================================
-- TEST 3: VÉRIFICATION DE LA TABLE MÉTADONNÉES
-- =====================================================

SELECT 
    'TEST 3: Vérification table métadonnées' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'anonymous_reports_metadata' 
            AND table_schema = 'public'
        ) THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END as result;

-- =====================================================
-- TEST 4: VÉRIFICATION DES FONCTIONS
-- =====================================================

SELECT 
    'TEST 4: Vérification fonctions' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'create_anonymous_report' 
            AND routine_schema = 'public'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_anonymous_reports_stats' 
            AND routine_schema = 'public'
        ) THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END as result;

-- =====================================================
-- TEST 5: TEST DE CRÉATION D'UN SIGNALEMENT ANONYME
-- =====================================================

-- Créer un signalement anonyme de test
SELECT 
    'TEST 5: Création signalement anonyme' as test_name,
    CASE 
        WHEN public.create_anonymous_report(
            'Test signalement anonyme - ' || NOW()::text,
            'Ceci est un test de signalement anonyme créé le ' || NOW()::text,
            'incident',
            'Libreville',
            '{"device_fingerprint": "test_' || EXTRACT(EPOCH FROM NOW()) || '", "user_agent": "Mozilla/5.0 Test", "timezone": "Africa/Libreville", "language": "fr"}'::jsonb
        ) IS NOT NULL THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END as result;

-- =====================================================
-- TEST 6: VÉRIFICATION DES STATISTIQUES
-- =====================================================

SELECT 
    'TEST 6: Vérification statistiques' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.get_anonymous_reports_stats()
        ) THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END as result;

-- =====================================================
-- AFFICHAGE DES RÉSULTATS DÉTAILLÉS
-- =====================================================

-- Afficher les détails du compte anonyme
SELECT 
    'DÉTAILS COMPTE ANONYME' as section,
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888009@ndjobi.com';

-- Afficher les détails du compte démo
SELECT 
    'DÉTAILS COMPTE DÉMO' as section,
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888008@ndjobi.com';

-- Afficher les statistiques anonymes
SELECT 
    'STATISTIQUES ANONYMES' as section,
    *
FROM public.get_anonymous_reports_stats();

-- Afficher les signalements anonymes récents
SELECT 
    'SIGNALEMENTS ANONYMES RÉCENTS' as section,
    s.id,
    s.title,
    s.description,
    s.type,
    s.created_at,
    arm.device_fingerprint,
    arm.user_agent
FROM public.signalements s
JOIN public.anonymous_reports_metadata arm ON s.id = arm.report_id
ORDER BY s.created_at DESC
LIMIT 5;

-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================

SELECT 
    '🎉 RÉSUMÉ DES TESTS' as summary,
    'Configuration du compte anonyme terminée' as status,
    'Le système est prêt pour les signalements anonymes' as message;
