-- Mettre à jour le profil du Super Admin avec le téléphone
UPDATE public.profiles 
SET 
    phone = '+33661002616',
    organization = 'NDJOBI Platform',
    updated_at = NOW()
WHERE email = '33661002616@ndjobi.com';

-- Assigner le rôle super_admin
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    u.id,
    'super_admin',
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Vérification finale
SELECT 
    'Compte Super Admin configuré' as status,
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';