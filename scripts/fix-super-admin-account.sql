-- Script pour corriger et créer le compte Super Admin
-- Email: 24177777000@ndjobi.com (nouveau domaine)
-- Mot de passe: 123456
-- Rôle: super_admin

-- 1. Vérifier si le compte existe avec l'ancien domaine
SELECT 'Compte avec ancien domaine:' as info, email, id, created_at 
FROM auth.users 
WHERE email = '24177777000@ndjobi.ga';

-- 2. Vérifier si le compte existe avec le nouveau domaine
SELECT 'Compte avec nouveau domaine:' as info, email, id, created_at 
FROM auth.users 
WHERE email = '24177777000@ndjobi.com';

-- 3. Vérifier les rôles existants pour ces comptes
SELECT 'Rôles existants:' as info, ur.role, au.email, au.id
FROM user_roles ur 
JOIN auth.users au ON au.id = ur.user_id 
WHERE au.email IN ('24177777000@ndjobi.ga', '24177777000@ndjobi.com');

-- 4. Si le compte avec l'ancien domaine existe, le mettre à jour
UPDATE auth.users 
SET email = '24177777000@ndjobi.com',
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'),
        '{email}',
        '"24177777000@ndjobi.com"'
    ),
    updated_at = now()
WHERE email = '24177777000@ndjobi.ga';

-- 5. Mettre à jour le profil correspondant
UPDATE profiles 
SET email = '24177777000@ndjobi.com',
    updated_at = now()
WHERE email = '24177777000@ndjobi.ga';

-- 6. Vérifier le résultat final
SELECT 'Compte final:' as info, email, id, created_at 
FROM auth.users 
WHERE email = '24177777000@ndjobi.com';

-- 7. Vérifier le rôle final
SELECT 'Rôle final:' as info, ur.role, au.email, au.id
FROM user_roles ur 
JOIN auth.users au ON au.id = ur.user_id 
WHERE au.email = '24177777000@ndjobi.com';
