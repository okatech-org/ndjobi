-- =====================================================
-- SCRIPT DE CRÉATION DES COMPTES DÉMO - SCHÉMA CORRECT
-- Basé sur le diagramme fourni par l'utilisateur
-- =====================================================

BEGIN;

-- =====================================================
-- 1. COMPTE ADMIN (Président / Admin - Vue globale, Validation)
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
                'full_name', 'Président / Admin',
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
            'Président / Admin',
            v_phone,
            'Présidence de la République',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_admin_id, 'admin', NOW());

        RAISE NOTICE '✅ Compte ADMIN (Président) créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 111111';
        RAISE NOTICE 'Organisation: Présidence de la République';
        RAISE NOTICE 'Rôle: Vue globale, Validation';
    ELSE
        UPDATE public.user_roles SET role = 'admin' WHERE user_id = v_admin_id;
        RAISE NOTICE '⚠️  Compte ADMIN existe déjà';
    END IF;
END $$;

-- =====================================================
-- 2. COMPTE SOUS-ADMIN DGSS (Vue sectorielle)
-- =====================================================

DO $$
DECLARE
    v_dgss_id uuid;
    v_phone TEXT := '+24177888002';
    v_email TEXT := '24177888002@ndjobi.com';
BEGIN
    SELECT id INTO v_dgss_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_dgss_id IS NULL THEN
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
                'full_name', 'Sous-Admin DGSS',
                'phone', v_phone,
                'organization', 'Direction Générale de la Sécurité des Systèmes'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_dgss_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_dgss_id,
            v_email,
            'Sous-Admin DGSS',
            v_phone,
            'Direction Générale de la Sécurité des Systèmes',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_dgss_id, 'sub_admin', NOW());

        RAISE NOTICE '✅ Compte SOUS-ADMIN DGSS créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 222222';
        RAISE NOTICE 'Organisation: Direction Générale de la Sécurité des Systèmes';
        RAISE NOTICE 'Rôle: Vue sectorielle, Assignation Agent';
    ELSE
        UPDATE public.user_roles SET role = 'sub_admin' WHERE user_id = v_dgss_id;
        RAISE NOTICE '⚠️  Compte SOUS-ADMIN DGSS existe déjà';
    END IF;
END $$;

-- =====================================================
-- 3. COMPTE SOUS-ADMIN DGR (Vue sectorielle)
-- =====================================================

DO $$
DECLARE
    v_dgr_id uuid;
    v_phone TEXT := '+24177888003';
    v_email TEXT := '24177888003@ndjobi.com';
BEGIN
    SELECT id INTO v_dgr_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_dgr_id IS NULL THEN
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
                'full_name', 'Sous-Admin DGR',
                'phone', v_phone,
                'organization', 'Direction Générale des Renseignements'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_dgr_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_dgr_id,
            v_email,
            'Sous-Admin DGR',
            v_phone,
            'Direction Générale des Renseignements',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_dgr_id, 'sub_admin', NOW());

        RAISE NOTICE '✅ Compte SOUS-ADMIN DGR créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 333333';
        RAISE NOTICE 'Organisation: Direction Générale des Renseignements';
        RAISE NOTICE 'Rôle: Vue sectorielle, Assignation Agent';
    ELSE
        UPDATE public.user_roles SET role = 'sub_admin' WHERE user_id = v_dgr_id;
        RAISE NOTICE '⚠️  Compte SOUS-ADMIN DGR existe déjà';
    END IF;
END $$;

-- =====================================================
-- 4. COMPTE AGENT (Ministères - Enquête)
-- =====================================================

DO $$
DECLARE
    v_agent_id uuid;
    v_phone TEXT := '+24177888004';
    v_email TEXT := '24177888004@ndjobi.com';
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
            crypt('444444', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Agent Ministères',
                'phone', v_phone,
                'organization', 'Ministères - Enquête'
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
            'Agent Ministères',
            v_phone,
            'Ministères - Enquête',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_agent_id, 'agent', NOW());

        RAISE NOTICE '✅ Compte AGENT (Ministères) créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 444444';
        RAISE NOTICE 'Organisation: Ministères - Enquête';
        RAISE NOTICE 'Rôle: Investigation, Vue sectorielle';
    ELSE
        UPDATE public.user_roles SET role = 'agent' WHERE user_id = v_agent_id;
        RAISE NOTICE '⚠️  Compte AGENT existe déjà';
    END IF;
END $$;

-- =====================================================
-- 5. COMPTE USER (Citoyens - Signalement)
-- =====================================================

DO $$
DECLARE
    v_user_id uuid;
    v_phone TEXT := '+24177888005';
    v_email TEXT := '24177888005@ndjobi.com';
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
            crypt('555555', gen_salt('bf')),
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

        RAISE NOTICE '✅ Compte USER (Citoyen) créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 555555';
        RAISE NOTICE 'Rôle: Envoi de signalement, Retour statut';
    ELSE
        UPDATE public.user_roles SET role = 'user' WHERE user_id = v_user_id;
        RAISE NOTICE '⚠️  Compte USER existe déjà';
    END IF;
END $$;

-- =====================================================
-- 6. VÉRIFICATION FINALE
-- =====================================================

SELECT 
    '====== COMPTES DÉMO CRÉÉS SELON LE SCHÉMA ======' as titre;

SELECT 
    ur.role AS "Rôle",
    p.full_name AS "Nom complet",
    p.phone AS "Téléphone",
    p.organization AS "Organisation",
    u.email AS "Email",
    CASE ur.role
        WHEN 'admin' THEN '111111'
        WHEN 'sub_admin' THEN 
            CASE p.organization
                WHEN 'Direction Générale de la Sécurité des Systèmes' THEN '222222'
                WHEN 'Direction Générale des Renseignements' THEN '333333'
            END
        WHEN 'agent' THEN '444444'
        WHEN 'user' THEN '555555'
    END AS "PIN"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN (
    '24177888001@ndjobi.com',
    '24177888002@ndjobi.com',
    '24177888003@ndjobi.com',
    '24177888004@ndjobi.com',
    '24177888005@ndjobi.com'
)
ORDER BY 
    CASE ur.role 
        WHEN 'admin' THEN 1
        WHEN 'sub_admin' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'user' THEN 4
    END,
    CASE WHEN ur.role = 'sub_admin' THEN p.organization END;

COMMIT;

-- =====================================================
-- RÉCAPITULATIF SELON LE SCHÉMA
-- =====================================================

/*
╔════════════════════════════════════════════════════════════╗
║           COMPTES DÉMO SELON LE SCHÉMA FOURNI             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  1. SUPER ADMIN (Contrôle total) [Rôle Système]          ║
║     📱 Téléphone : +33 6 61 00 26 16                      ║
║     🔐 PIN       : 999999                                 ║
║     🏢 Organisation : NDJOBI Platform                     ║
║                                                            ║
║  2. ADMIN (Président / Admin - Vue globale, Validation)   ║
║     📱 Téléphone : +241 77 888 001                        ║
║     🔐 PIN       : 111111                                 ║
║     🏢 Organisation : Présidence de la République         ║
║                                                            ║
║  3. SOUS-ADMIN DGSS (Vue sectorielle)                     ║
║     📱 Téléphone : +241 77 888 002                        ║
║     🔐 PIN       : 222222                                 ║
║     🏢 Organisation : Direction Générale Sécurité Systèmes║
║                                                            ║
║  4. SOUS-ADMIN DGR (Vue sectorielle)                      ║
║     📱 Téléphone : +241 77 888 003                        ║
║     🔐 PIN       : 333333                                 ║
║     🏢 Organisation : Direction Générale Renseignements   ║
║                                                            ║
║  5. AGENT (Ministères - Enquête)                          ║
║     📱 Téléphone : +241 77 888 004                        ║
║     🔐 PIN       : 444444                                 ║
║     🏢 Organisation : Ministères - Enquête                ║
║                                                            ║
║  6. USER (Citoyens - Signalement)                         ║
║     📱 Téléphone : +241 77 888 005                        ║
║     🔐 PIN       : 555555                                 ║
║     👤 Type : Citoyen ordinaire                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
*/
