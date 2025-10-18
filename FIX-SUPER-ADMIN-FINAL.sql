-- ============================================================================
-- SCRIPT FINAL : CRÉATION PROFIL SUPER ADMIN
-- ============================================================================
-- Ce script résout le problème de "infinite recursion" en désactivant RLS
-- ID du compte existant : 84401dfc-f23e-46e7-b201-868f2140ab73
-- ============================================================================

-- ÉTAPE 1 : Désactiver RLS temporairement
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2 : Créer/Mettre à jour le profil pour l'ID existant
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    organization,
    created_at,
    updated_at
)
VALUES (
    '84401dfc-f23e-46e7-b201-868f2140ab73',
    '33661002616@ndjobi.com',
    'Super Administrateur',
    '+33661002616',
    'Administration Système',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    organization = EXCLUDED.organization,
    updated_at = NOW();

-- ÉTAPE 3 : Attribuer le rôle super_admin
INSERT INTO public.user_roles (
    user_id,
    role,
    created_at
)
VALUES (
    '84401dfc-f23e-46e7-b201-868f2140ab73',
    'super_admin',
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    created_at = NOW();

-- ÉTAPE 4 : Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5 : Vérification finale
SELECT 
    '✅ COMPTE SUPER ADMIN CONFIGURÉ' as status,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    p.organization,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.id = '84401dfc-f23e-46e7-b201-868f2140ab73';

-- ============================================================================
-- RÉSULTAT ATTENDU :
-- ============================================================================
-- Vous devriez voir une ligne avec :
--   - id: 84401dfc-f23e-46e7-b201-868f2140ab73
--   - email: 33661002616@ndjobi.com
--   - phone: +33661002616
--   - full_name: Super Administrateur
--   - organization: Administration Système
--   - role: super_admin
-- ============================================================================

