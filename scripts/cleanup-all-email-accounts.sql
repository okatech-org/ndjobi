-- =====================================================
-- SUPPRESSION DE TOUS LES COMPTES AVEC EMAILS TEXTE
-- Ne garde que les comptes avec format numérique (ex: 33661002616@ndjobi.com)
-- =====================================================

BEGIN;

-- ÉTAPE 1: Lister tous les comptes avec emails texte (pour vérification)
SELECT 
    '🔍 COMPTES À SUPPRIMER (emails texte)' as action,
    u.id,
    u.email,
    u.created_at,
    ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email ~ '[a-z]+@'  -- Emails contenant des lettres avant le @
  AND u.email NOT LIKE '%@me.com'  -- Exclure iasted@me.com si existe
ORDER BY u.email;

-- ÉTAPE 2: Supprimer les rôles associés
DELETE FROM public.user_roles
WHERE user_id IN (
    SELECT u.id
    FROM auth.users u
    WHERE u.email ~ '[a-z]+@'
      AND u.email NOT LIKE '%@me.com'
);

-- ÉTAPE 3: Supprimer les profils associés
DELETE FROM public.profiles
WHERE id IN (
    SELECT u.id
    FROM auth.users u
    WHERE u.email ~ '[a-z]+@'
      AND u.email NOT LIKE '%@me.com'
);

-- ÉTAPE 4: Supprimer les utilisateurs de auth.users
DELETE FROM auth.users
WHERE email ~ '[a-z]+@'
  AND email NOT LIKE '%@me.com';

-- ÉTAPE 5: Lister les comptes restants (tous numériques)
SELECT 
    '✅ COMPTES RESTANTS (numériques)' as action,
    u.id,
    u.email,
    u.created_at,
    p.full_name,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.email;

RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════';
RAISE NOTICE '  ✅ NETTOYAGE TERMINÉ !';
RAISE NOTICE '═══════════════════════════════════════════════════════';
RAISE NOTICE '';
RAISE NOTICE '🗑️  Comptes supprimés : Tous les emails avec format texte';
RAISE NOTICE '✅ Comptes conservés : Uniquement format numérique (ex: 33661002616@ndjobi.com)';
RAISE NOTICE '';
RAISE NOTICE '💡 Le compte 33661002616@ndjobi.com peut être Super Admin';
RAISE NOTICE '   en lui attribuant le rôle super_admin.';
RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════';

COMMIT;

