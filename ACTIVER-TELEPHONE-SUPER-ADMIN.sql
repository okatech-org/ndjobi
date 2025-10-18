-- ============================================================================
-- SCRIPT : ACTIVER LE TÉLÉPHONE DU COMPTE SUPER ADMIN
-- ============================================================================
-- Le compte existe avec l'email mais le téléphone n'est pas activé
-- Ce script active le téléphone dans auth.users
-- ============================================================================

-- ÉTAPE 1 : Mettre à jour auth.users avec le téléphone actif
UPDATE auth.users
SET 
    phone = '+33661002616',
    phone_confirmed_at = NOW(),
    raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{providers}',
        '["email", "phone"]'::jsonb
    ),
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{phone}',
        '"+33661002616"'::jsonb
    ),
    updated_at = NOW()
WHERE id = '84401dfc-f23e-46e7-b201-868f2140ab73';

-- ÉTAPE 2 : Vérifier que le profil existe dans public.profiles
-- (Devrait déjà exister après le script précédent)
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
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- ÉTAPE 3 : Vérifier que le rôle existe
-- (Devrait déjà exister après le script précédent)
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
    role = EXCLUDED.role;

-- ÉTAPE 4 : Vérification complète
SELECT 
    '✅ COMPTE SUPER ADMIN COMPLET' as status,
    u.id,
    u.email,
    u.phone as "phone_auth_users",
    u.phone_confirmed_at as "phone_confirmed",
    u.raw_app_meta_data->>'providers' as "providers",
    p.full_name,
    p.phone as "phone_profiles",
    p.organization,
    ur.role,
    u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.id = '84401dfc-f23e-46e7-b201-868f2140ab73';

-- ============================================================================
-- RÉSULTAT ATTENDU :
-- ============================================================================
-- Vous devriez voir :
--   - phone_auth_users: +33661002616
--   - phone_confirmed: (une date/heure)
--   - providers: ["email", "phone"]
--   - full_name: Super Administrateur
--   - phone_profiles: +33661002616
--   - role: super_admin
-- ============================================================================

-- BONUS : Vérifier que le téléphone est bien activé
SELECT 
    '📱 VÉRIFICATION TÉLÉPHONE' as status,
    CASE 
        WHEN phone IS NOT NULL AND phone_confirmed_at IS NOT NULL 
        THEN '✅ Téléphone actif'
        WHEN phone IS NOT NULL AND phone_confirmed_at IS NULL 
        THEN '⚠️ Téléphone présent mais non confirmé'
        ELSE '❌ Téléphone manquant'
    END as "statut_telephone",
    phone,
    phone_confirmed_at
FROM auth.users
WHERE id = '84401dfc-f23e-46e7-b201-868f2140ab73';

