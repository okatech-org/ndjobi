-- Script pour créer le compte Protocole d'État (Président)
-- IMPORTANT: Ce script doit être exécuté avec des privilèges super_admin

-- 1. Créer l'utilisateur dans auth.users (à faire via Supabase Dashboard ou API)
-- Téléphone: +241 77 777 003
-- Email: 24177777003@ndjobi.temp
-- PIN: 123456

-- 2. Insérer ou mettre à jour le profil
INSERT INTO public.profiles (id, full_name, email, role, organization, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Protocole d''État - Président de la République',
    '24177777003@ndjobi.temp',
    'admin',
    'Présidence de la République du Gabon',
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    organization = EXCLUDED.organization,
    updated_at = now();

-- 3. Assigner explicitement le rôle admin dans user_roles
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'admin',
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role;

-- 4. Créer les paramètres utilisateur
INSERT INTO public.user_settings (
    user_id,
    language,
    theme,
    timezone,
    email_notifications,
    sms_notifications,
    push_notifications,
    security_alerts,
    report_updates,
    project_updates,
    anonymous_reports,
    profile_visibility,
    show_email,
    show_phone,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'fr',
    'system',
    'Africa/Libreville',
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    'private',
    false,
    false,
    now(),
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    language = EXCLUDED.language,
    theme = EXCLUDED.theme,
    timezone = EXCLUDED.timezone,
    updated_at = now();

-- 5. Créer le PIN hash (SHA-256 de "123456")
-- Note: En production, utiliser un PIN fort et aléatoire
INSERT INTO public.user_pins (user_id, pin_hash, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    now(),
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    pin_hash = EXCLUDED.pin_hash,
    updated_at = now();

-- 6. Logger la création du compte
INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    timestamp
)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'account_created',
    'admin_account',
    '00000000-0000-0000-0000-000000000003',
    jsonb_build_object(
        'type', 'protocole_etat',
        'organization', 'Présidence de la République du Gabon',
        'created_by', 'system',
        'creation_date', now()
    ),
    now()
);

-- 7. Vérification
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.role,
    p.organization,
    ur.role as user_role,
    CASE WHEN up.pin_hash IS NOT NULL THEN 'PIN configuré' ELSE 'Pas de PIN' END as pin_status
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.user_pins up ON p.id = up.user_id
WHERE p.id = '00000000-0000-0000-0000-000000000003';

