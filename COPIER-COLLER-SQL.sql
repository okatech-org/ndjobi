-- ════════════════════════════════════════════════════════════
-- COPIER ET COLLER CE SCRIPT DANS SUPABASE SQL EDITOR
-- ════════════════════════════════════════════════════════════
-- URL: https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/sql
-- ════════════════════════════════════════════════════════════

BEGIN;

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Trouver l'ID de l'utilisateur superadmin@ndjobi.com
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'superadmin@ndjobi.com';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilisateur non trouvé. Créez d''abord le compte via Auth > Users';
    END IF;
    
    -- Créer/mettre à jour le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
        v_user_id,
        'superadmin@ndjobi.com',
        'Super Administrateur',
        '+33661002616',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';
    
    RAISE NOTICE '✅ Compte Super Admin configuré avec succès!';
    RAISE NOTICE 'Email: superadmin@ndjobi.com';
    RAISE NOTICE 'Code OTP: 999999';
    
END $$;

COMMIT;

-- Vérification
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.full_name,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'superadmin@ndjobi.com';
