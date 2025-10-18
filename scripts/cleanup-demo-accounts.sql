-- =====================================================
-- Script pour nettoyer les comptes démo
-- Garde uniquement : 24177777001@ndjobi.ga
-- =====================================================

BEGIN;

-- Supprimer les comptes démo (en gardant 24177777001@ndjobi.ga)
DELETE FROM auth.users 
WHERE email IN (
    '24177777000@ndjobi.ga',           -- Compte démo à supprimer
    'president+v2@demo.ndjobi.ga',     -- Compte démo à supprimer
    'agent+v2@demo.ndjobi.ga',         -- Compte démo à supprimer
    'citoyen+v2@demo.ndjobi.ga',       -- Compte démo à supprimer
    'citoyen@demo.ndjobi.ga'           -- Compte démo à supprimer
);

-- Supprimer les profils correspondants
DELETE FROM public.profiles 
WHERE email IN (
    '24177777000@ndjobi.ga',
    'president+v2@demo.ndjobi.ga',
    'agent+v2@demo.ndjobi.ga',
    'citoyen+v2@demo.ndjobi.ga',
    'citoyen@demo.ndjobi.ga'
);

-- Supprimer les rôles correspondants
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        '24177777000@ndjobi.ga',
        'president+v2@demo.ndjobi.ga',
        'agent+v2@demo.ndjobi.ga',
        'citoyen+v2@demo.ndjobi.ga',
        'citoyen@demo.ndjobi.ga'
    )
);

-- Vérification finale
SELECT 
    u.email,
    u.created_at,
    p.full_name,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.email;

RAISE NOTICE '✅ Comptes démo nettoyés !';
RAISE NOTICE '✅ Compte gardé : 24177777001@ndjobi.ga';
RAISE NOTICE '✅ Compte Super Admin : superadmin@ndjobi.com';

COMMIT;
