-- =====================================================
-- SCRIPT DE CRÉATION DES COMPTES DÉMO - LOGIQUE COMPLÈTE
-- Basé sur la hiérarchie des rôles et permissions détaillée
-- =====================================================

BEGIN;

-- =====================================================
-- 1. COMPTE ADMIN (Président / Administrateur)
-- Vue d'ensemble, validation, stratégie générale
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
                'full_name', 'Président / Administrateur',
                'phone', v_phone,
                'organization', 'Présidence de la République',
                'role_description', 'Supervision globale, validation, stratégie générale'
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
            'Président / Administrateur',
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
        RAISE NOTICE 'Fonction: Supervision globale, validation, stratégie générale';
    ELSE
        UPDATE public.user_roles SET role = 'admin' WHERE user_id = v_admin_id;
        RAISE NOTICE '⚠️  Compte ADMIN existe déjà';
    END IF;
END $$;

-- =====================================================
-- 2. COMPTE SOUS-ADMIN DGSS (Direction Générale Sécurité)
-- Vue sectorielle, supervision agents, relais stratégique
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
                'organization', 'Direction Générale de la Sécurité et de la Surveillance',
                'role_description', 'Vue sectorielle, supervision agents, relais stratégique'
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
            'Direction Générale de la Sécurité et de la Surveillance',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_dgss_id, 'sub_admin', NOW());

        RAISE NOTICE '✅ Compte SOUS-ADMIN DGSS créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 222222';
        RAISE NOTICE 'Fonction: Vue sectorielle, supervision agents, relais stratégique';
    ELSE
        UPDATE public.user_roles SET role = 'sub_admin' WHERE user_id = v_dgss_id;
        RAISE NOTICE '⚠️  Compte SOUS-ADMIN DGSS existe déjà';
    END IF;
END $$;

-- =====================================================
-- 3. COMPTE SOUS-ADMIN DGR (Direction Générale Renseignements)
-- Vue sectorielle, supervision agents, relais stratégique
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
                'organization', 'Direction Générale des Renseignements',
                'role_description', 'Vue sectorielle, supervision agents, relais stratégique'
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
        RAISE NOTICE 'Fonction: Vue sectorielle, supervision agents, relais stratégique';
    ELSE
        UPDATE public.user_roles SET role = 'sub_admin' WHERE user_id = v_dgr_id;
        RAISE NOTICE '⚠️  Compte SOUS-ADMIN DGR existe déjà';
    END IF;
END $$;

-- =====================================================
-- 4. COMPTE AGENT MINISTÈRE DÉFENSE
-- Enquêtes opérationnelles, signalements assignés
-- =====================================================

DO $$
DECLARE
    v_agent_defense_id uuid;
    v_phone TEXT := '+24177888004';
    v_email TEXT := '24177888004@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_defense_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_agent_defense_id IS NULL THEN
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
                'full_name', 'Agent Ministère Défense',
                'phone', v_phone,
                'organization', 'Ministère de la Défense',
                'role_description', 'Enquêtes opérationnelles, signalements assignés'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_agent_defense_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_agent_defense_id,
            v_email,
            'Agent Ministère Défense',
            v_phone,
            'Ministère de la Défense',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_agent_defense_id, 'agent', NOW());

        RAISE NOTICE '✅ Compte AGENT Défense créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 444444';
        RAISE NOTICE 'Fonction: Enquêtes opérationnelles, signalements assignés';
    ELSE
        UPDATE public.user_roles SET role = 'agent' WHERE user_id = v_agent_defense_id;
        RAISE NOTICE '⚠️  Compte AGENT Défense existe déjà';
    END IF;
END $$;

-- =====================================================
-- 5. COMPTE AGENT MINISTÈRE JUSTICE
-- Enquêtes opérationnelles, signalements assignés
-- =====================================================

DO $$
DECLARE
    v_agent_justice_id uuid;
    v_phone TEXT := '+24177888005';
    v_email TEXT := '24177888005@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_justice_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_agent_justice_id IS NULL THEN
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
                'full_name', 'Agent Ministère Justice',
                'phone', v_phone,
                'organization', 'Ministère de la Justice',
                'role_description', 'Enquêtes opérationnelles, signalements assignés'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_agent_justice_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_agent_justice_id,
            v_email,
            'Agent Ministère Justice',
            v_phone,
            'Ministère de la Justice',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_agent_justice_id, 'agent', NOW());

        RAISE NOTICE '✅ Compte AGENT Justice créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 555555';
        RAISE NOTICE 'Fonction: Enquêtes opérationnelles, signalements assignés';
    ELSE
        UPDATE public.user_roles SET role = 'agent' WHERE user_id = v_agent_justice_id;
        RAISE NOTICE '⚠️  Compte AGENT Justice existe déjà';
    END IF;
END $$;

-- =====================================================
-- 6. COMPTE AGENT LUTTE ANTI-CORRUPTION
-- Enquêtes opérationnelles, signalements assignés
-- =====================================================

DO $$
DECLARE
    v_agent_lac_id uuid;
    v_phone TEXT := '+24177888006';
    v_email TEXT := '24177888006@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_lac_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_agent_lac_id IS NULL THEN
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
            crypt('666666', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Agent Lutte Anti-Corruption',
                'phone', v_phone,
                'organization', 'Commission de Lutte Anti-Corruption',
                'role_description', 'Enquêtes opérationnelles, signalements assignés'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_agent_lac_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_agent_lac_id,
            v_email,
            'Agent Lutte Anti-Corruption',
            v_phone,
            'Commission de Lutte Anti-Corruption',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_agent_lac_id, 'agent', NOW());

        RAISE NOTICE '✅ Compte AGENT Lutte Anti-Corruption créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 666666';
        RAISE NOTICE 'Fonction: Enquêtes opérationnelles, signalements assignés';
    ELSE
        UPDATE public.user_roles SET role = 'agent' WHERE user_id = v_agent_lac_id;
        RAISE NOTICE '⚠️  Compte AGENT Lutte Anti-Corruption existe déjà';
    END IF;
END $$;

-- =====================================================
-- 7. COMPTE AGENT MINISTÈRE INTÉRIEUR
-- Enquêtes opérationnelles, signalements assignés
-- =====================================================

DO $$
DECLARE
    v_agent_interieur_id uuid;
    v_phone TEXT := '+24177888007';
    v_email TEXT := '24177888007@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_interieur_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_agent_interieur_id IS NULL THEN
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
            crypt('777777', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Agent Ministère Intérieur',
                'phone', v_phone,
                'organization', 'Ministère de l''Intérieur',
                'role_description', 'Enquêtes opérationnelles, signalements assignés'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_agent_interieur_id;

        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_agent_interieur_id,
            v_email,
            'Agent Ministère Intérieur',
            v_phone,
            'Ministère de l''Intérieur',
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_agent_interieur_id, 'agent', NOW());

        RAISE NOTICE '✅ Compte AGENT Intérieur créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 777777';
        RAISE NOTICE 'Fonction: Enquêtes opérationnelles, signalements assignés';
    ELSE
        UPDATE public.user_roles SET role = 'agent' WHERE user_id = v_agent_interieur_id;
        RAISE NOTICE '⚠️  Compte AGENT Intérieur existe déjà';
    END IF;
END $$;

-- =====================================================
-- 8. COMPTE USER (Citoyen avec compte)
-- Envoi signalements, suivi, consultation statistiques
-- =====================================================

DO $$
DECLARE
    v_user_id uuid;
    v_phone TEXT := '+24177888008';
    v_email TEXT := '24177888008@ndjobi.com';
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
            crypt('888888', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Citoyen Démo',
                'phone', v_phone,
                'role_description', 'Envoi signalements, suivi, consultation statistiques'
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
        RAISE NOTICE 'PIN: 888888';
        RAISE NOTICE 'Fonction: Envoi signalements, suivi, consultation statistiques';
    ELSE
        UPDATE public.user_roles SET role = 'user' WHERE user_id = v_user_id;
        RAISE NOTICE '⚠️  Compte USER existe déjà';
    END IF;
END $$;

-- =====================================================
-- 9. COMPTE USER ANONYME (Citoyen sans compte)
-- Envoi signalements anonymes
-- =====================================================

DO $$
DECLARE
    v_user_anonyme_id uuid;
    v_phone TEXT := '+24177888009';
    v_email TEXT := '24177888009@ndjobi.com';
BEGIN
    SELECT id INTO v_user_anonyme_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_user_anonyme_id IS NULL THEN
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
            crypt('999999', gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Citoyen Anonyme',
                'phone', v_phone,
                'role_description', 'Envoi signalements anonymes'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_user_anonyme_id;

        INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
        VALUES (
            v_user_anonyme_id,
            v_email,
            'Citoyen Anonyme',
            v_phone,
            NOW(),
            NOW()
        );

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_user_anonyme_id, 'user', NOW());

        RAISE NOTICE '✅ Compte USER Anonyme créé';
        RAISE NOTICE 'Téléphone: %', v_phone;
        RAISE NOTICE 'PIN: 999999';
        RAISE NOTICE 'Fonction: Envoi signalements anonymes';
    ELSE
        UPDATE public.user_roles SET role = 'user' WHERE user_id = v_user_anonyme_id;
        RAISE NOTICE '⚠️  Compte USER Anonyme existe déjà';
    END IF;
END $$;

-- =====================================================
-- 10. VÉRIFICATION FINALE
-- =====================================================

SELECT 
    '====== COMPTES DÉMO CRÉÉS SELON LA LOGIQUE COMPLÈTE ======' as titre;

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
                WHEN 'Direction Générale de la Sécurité et de la Surveillance' THEN '222222'
                WHEN 'Direction Générale des Renseignements' THEN '333333'
            END
        WHEN 'agent' THEN 
            CASE p.organization
                WHEN 'Ministère de la Défense' THEN '444444'
                WHEN 'Ministère de la Justice' THEN '555555'
                WHEN 'Commission de Lutte Anti-Corruption' THEN '666666'
                WHEN 'Ministère de l''Intérieur' THEN '777777'
            END
        WHEN 'user' THEN 
            CASE p.full_name
                WHEN 'Citoyen Démo' THEN '888888'
                WHEN 'Citoyen Anonyme' THEN '999999'
            END
    END AS "PIN"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN (
    '24177888001@ndjobi.com',
    '24177888002@ndjobi.com',
    '24177888003@ndjobi.com',
    '24177888004@ndjobi.com',
    '24177888005@ndjobi.com',
    '24177888006@ndjobi.com',
    '24177888007@ndjobi.com',
    '24177888008@ndjobi.com',
    '24177888009@ndjobi.com'
)
ORDER BY 
    CASE ur.role 
        WHEN 'admin' THEN 1
        WHEN 'sub_admin' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'user' THEN 4
    END,
    CASE WHEN ur.role = 'sub_admin' THEN p.organization END,
    CASE WHEN ur.role = 'agent' THEN p.organization END,
    CASE WHEN ur.role = 'user' THEN p.full_name END;

COMMIT;

-- =====================================================
-- RÉCAPITULATIF SELON LA LOGIQUE COMPLÈTE
-- =====================================================

/*
╔════════════════════════════════════════════════════════════╗
║           COMPTES DÉMO SELON LA LOGIQUE COMPLÈTE          ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  SUPER ADMIN (Contrôle total) [Rôle Système]             ║
║     📱 Téléphone : +33 6 61 00 26 16                      ║
║     🔐 PIN       : 999999                                 ║
║     🏢 Organisation : NDJOBI Platform                      ║
║                                                            ║
║  ADMIN (Président / Administrateur)                       ║
║     📱 Téléphone : +241 77 888 001                        ║
║     🔐 PIN       : 111111                                 ║
║     🏢 Organisation : Présidence de la République          ║
║     🎯 Fonction : Supervision globale, validation, stratégie ║
║                                                            ║
║  SOUS-ADMIN DGSS (Vue sectorielle)                        ║
║     📱 Téléphone : +241 77 888 002                        ║
║     🔐 PIN       : 222222                                 ║
║     🏢 Organisation : Direction Générale Sécurité          ║
║     🎯 Fonction : Vue sectorielle, supervision agents     ║
║                                                            ║
║  SOUS-ADMIN DGR (Vue sectorielle)                         ║
║     📱 Téléphone : +241 77 888 003                        ║
║     🔐 PIN       : 333333                                 ║
║     🏢 Organisation : Direction Générale Renseignements   ║
║     🎯 Fonction : Vue sectorielle, supervision agents     ║
║                                                            ║
║  AGENT DÉFENSE (Enquêtes opérationnelles)                ║
║     📱 Téléphone : +241 77 888 004                        ║
║     🔐 PIN       : 444444                                 ║
║     🏢 Organisation : Ministère de la Défense             ║
║     🎯 Fonction : Enquêtes opérationnelles, signalements ║
║                                                            ║
║  AGENT JUSTICE (Enquêtes opérationnelles)                ║
║     📱 Téléphone : +241 77 888 005                        ║
║     🔐 PIN       : 555555                                 ║
║     🏢 Organisation : Ministère de la Justice             ║
║     🎯 Fonction : Enquêtes opérationnelles, signalements ║
║                                                            ║
║  AGENT LUTTE ANTI-CORRUPTION (Enquêtes opérationnelles)  ║
║     📱 Téléphone : +241 77 888 006                        ║
║     🔐 PIN       : 666666                                 ║
║     🏢 Organisation : Commission de Lutte Anti-Corruption ║
║     🎯 Fonction : Enquêtes opérationnelles, signalements ║
║                                                            ║
║  AGENT INTÉRIEUR (Enquêtes opérationnelles)              ║
║     📱 Téléphone : +241 77 888 007                        ║
║     🔐 PIN       : 777777                                 ║
║     🏢 Organisation : Ministère de l'Intérieur            ║
║     🎯 Fonction : Enquêtes opérationnelles, signalements ║
║                                                            ║
║  USER CITOYEN (Envoi signalements, suivi)                ║
║     📱 Téléphone : +241 77 888 008                        ║
║     🔐 PIN       : 888888                                 ║
║     🏢 Organisation : -                                    ║
║     🎯 Fonction : Envoi signalements, suivi, statistiques ║
║                                                            ║
║  USER ANONYME (Envoi signalements anonymes)              ║
║     📱 Téléphone : +241 77 888 009                        ║
║     🔐 PIN       : 999999                                 ║
║     🏢 Organisation : -                                    ║
║     🎯 Fonction : Envoi signalements anonymes             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
*/
