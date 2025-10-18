-- Script pour créer le profil manquant du Super Admin
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- CRÉATION DU PROFIL MANQUANT POUR LE SUPER ADMIN
-- =====================================================

-- Désactiver temporairement RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Créer le profil manquant pour le Super Admin existant
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    organization,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Super Administrateur',
    u.phone,
    'Administration Système',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    organization = EXCLUDED.organization,
    updated_at = NOW();

-- Créer le rôle super_admin pour le Super Admin
INSERT INTO public.user_roles (
    user_id,
    role,
    created_at
)
SELECT 
    u.id,
    'super_admin',
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Vérification finale
SELECT 
    'VÉRIFICATION PROFIL SUPER ADMIN' as status,
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
WHERE u.email = '33661002616@ndjobi.com';

-- Vérifier tous les comptes récents
SELECT 
    'TOUS LES COMPTES RÉCENTS' as status,
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
