-- =====================================================
-- SCRIPT DE CRÉATION DES COMPTES DÉMO - NDJOBI v2.0
-- Authentification : Numéro de téléphone + PIN à 6 chiffres
-- =====================================================

BEGIN;

-- =====================================================
-- 1. COMPTE ADMIN (Protocole d'État - Président)
-- =====================================================

DO $$
DECLARE
    v_admin_id uuid;
    v_phone TEXT := '+24177888001';
    v_email TEXT := '24177888001@ndjobi.com';
BEGIN
    SELECT id INTO v_admin_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_admin_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            phone_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('111111', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Protocole d''État - Président',
                'phone', v_phone,
                'organization', 'Présidence de la République'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_admin_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_admin_id,
            v_email,
            'Protocole d''État - Président',
            v_phone,
            'Présidence de la République',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_admin_id, 'admin', NOW());

        RAISE NOTICE '✅ Compte ADMIN créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 111111';
        RAISE NOTICE 'Organisation: Présidence de la République';
    ELSE
        UPDATE public.user_roles SET role = 'admin' WHERE user_id = v_admin_id;
        RAISE NOTICE '⚠️  Compte ADMIN existe déjà';
    END IF;
END $$;

-- =====================================================
-- 2. COMPTE AGENT (DGSS - Direction Générale Sécurité)
-- =====================================================

DO $$
DECLARE
    v_agent_id uuid;
    v_phone TEXT := '+24177888002';
    v_email TEXT := '24177888002@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_agent_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            phone_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('222222', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Agent Principal DGSS',
                'phone', v_phone,
                'organization', 'Direction Générale de la Sécurité'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_agent_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_agent_id,
            v_email,
            'Agent Principal DGSS',
            v_phone,
            'Direction Générale de la Sécurité',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_agent_id, 'agent', NOW());

        RAISE NOTICE '✅ Compte AGENT créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 222222';
        RAISE NOTICE 'Organisation: Direction Générale de la Sécurité';
    ELSE
        UPDATE public.user_roles SET role = 'agent' WHERE user_id = v_agent_id;
        RAISE NOTICE '⚠️  Compte AGENT existe déjà';
    END IF;
END $$;

-- =====================================================
-- 3. COMPTE SOUS-ADMIN (Sous-Administrateur)
-- =====================================================

DO $$
DECLARE
    v_sub_admin_id uuid;
    v_phone TEXT := '+24177888004';
    v_email TEXT := '24177888004@ndjobi.com';
BEGIN
    SELECT id INTO v_sub_admin_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_sub_admin_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            phone_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('444444', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Sous-Administrateur',
                'phone', v_phone,
                'organization', 'Administration Déléguée'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_sub_admin_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_sub_admin_id,
            v_email,
            'Sous-Administrateur',
            v_phone,
            'Administration Déléguée',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_sub_admin_id, 'sub_admin', NOW());

        RAISE NOTICE '✅ Compte SOUS-ADMIN créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 444444';
        RAISE NOTICE 'Organisation: Administration Déléguée';
    ELSE
        UPDATE public.user_roles SET role = 'sub_admin' WHERE user_id = v_sub_admin_id;
        RAISE NOTICE '⚠️  Compte SOUS-ADMIN existe déjà';
    END IF;
END $$;

-- =====================================================
-- 4. COMPTE USER (Citoyen ordinaire)
-- =====================================================

DO $$
DECLARE
    v_user_id uuid;
    v_phone TEXT := '+24177888003';
    v_email TEXT := '24177888003@ndjobi.com';
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            phone_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('333333', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Citoyen Démo',
                'phone', v_phone
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_user_id;

        INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
        VALUES (
            v_user_id,
            v_email,
            'Citoyen Démo',
            v_phone,
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_user_id, 'user', NOW());

        RAISE NOTICE '✅ Compte USER créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 333333';
        RAISE NOTICE 'Type: Citoyen ordinaire';
    ELSE
        UPDATE public.user_roles SET role = 'user' WHERE user_id = v_user_id;
        RAISE NOTICE '⚠️  Compte USER existe déjà';
    END IF;
END $$;

-- =====================================================
-- 5. VÉRIFICATION FINALE
-- =====================================================

SELECT 
    '====== COMPTES DÉMO CRÉÉS ======' as titre;

SELECT 
    ur.role AS "Rôle",
    p.full_name AS "Nom complet",
    p.phone AS "Téléphone",
    p.organization AS "Organisation",
    u.email AS "Email",
    CASE ur.role
        WHEN 'admin' THEN '111111'
        WHEN 'agent' THEN '222222'
        WHEN 'user' THEN '333333'
        WHEN 'sub_admin' THEN '444444'
    END AS "PIN"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN (
    '24177888001@ndjobi.com',
    '24177888002@ndjobi.com',
    '24177888003@ndjobi.com',
    '24177888004@ndjobi.com'
)
ORDER BY 
    CASE ur.role 
        WHEN 'admin' THEN 1
        WHEN 'sub_admin' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'user' THEN 4
    END;

COMMIT;

-- =====================================================
-- RÉCAPITULATIF DES COMPTES
-- =====================================================

/*
╔════════════════════════════════════════════════════════════╗
║           COMPTES DÉMO NDJOBI - RÉCAPITULATIF             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  1. ADMIN (Protocole d'État)                               ║
║     📱 Téléphone : +241 77 888 001                        ║
║     🔐 PIN       : 111111                                 ║
║     🏢 Organisation : Présidence de la République         ║
║                                                            ║
║  2. AGENT (DGSS)                                          ║
║     📱 Téléphone : +241 77 888 002                        ║
║     🔐 PIN       : 222222                                 ║
║     🏢 Organisation : Direction Générale Sécurité         ║
║                                                            ║
║  3. USER (Citoyen)                                        ║
║     📱 Téléphone : +241 77 888 003                        ║
║     🔐 PIN       : 333333                                 ║
║     👤 Type : Citoyen ordinaire                           ║
║                                                            ║
║  4. SOUS-ADMIN (Sous-Administrateur)                      ║
║     📱 Téléphone : +241 77 888 004                        ║
║     🔐 PIN       : 444444                                 ║
║     🏢 Organisation : Administration Déléguée             ║
║                                                            ║
║  💡 Super Admin existe déjà :                             ║
║     📱 Téléphone : +33 6 61 00 26 16                      ║
║     🔐 PIN       : 999999                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
*/

