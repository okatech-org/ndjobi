-- Script de vérification après la correction
-- Exécutez ce script dans le SQL Editor de Supabase pour vérifier

-- 1. Vérifier que le compte admin existe
SELECT 
    '1. Compte Admin' as verification,
    u.id,
    u.email,
    u.phone,
    u.created_at,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmé'
        ELSE '❌ Non confirmé'
    END as email_status
FROM auth.users u
WHERE u.email = '24177888001@ndjobi.com'
   OR u.phone = '+24177888001';

-- 2. Vérifier le profil
SELECT 
    '2. Profil Admin' as verification,
    p.*
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = '24177888001@ndjobi.com';

-- 3. Vérifier le rôle (doit avoir UN SEUL rôle)
SELECT 
    '3. Rôle Admin' as verification,
    ur.*,
    COUNT(*) OVER (PARTITION BY ur.user_id) as nb_roles
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = '24177888001@ndjobi.com';

-- 4. Vérifier la contrainte UNIQUE
SELECT 
    '4. Contraintes user_roles' as verification,
    tc.constraint_name,
    tc.constraint_type,
    STRING_AGG(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'user_roles'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name, tc.constraint_type;

-- 5. Tester la fonction has_role
SELECT 
    '5. Test fonction has_role' as verification,
    u.email,
    public.has_role(u.id, 'admin'::app_role) as est_admin
FROM auth.users u
WHERE u.email = '24177888001@ndjobi.com';

-- 6. Tester la fonction get_user_role
SELECT 
    '6. Test fonction get_user_role' as verification,
    u.email,
    public.get_user_role(u.id) as role
FROM auth.users u
WHERE u.email = '24177888001@ndjobi.com';

