-- Script complet pour créer tous les comptes de démonstration NDJOBI
-- À exécuter dans le SQL Editor de Supabase
-- Project ID: xfxqwlbqysiezqdpeqpv

-- =====================================================
-- 1. ADMIN (Président) - +24177888001 / PIN: 111111
-- =====================================================

DO $$
DECLARE
    v_admin_id uuid;
    v_phone TEXT := '+24177888001';
    v_email TEXT := '24177888001@ndjobi.com';
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    SELECT id INTO v_admin_id FROM auth.users WHERE email = v_email;
    
    IF v_admin_id IS NULL THEN
        -- Créer l'utilisateur dans auth.users
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, phone, phone_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
            'authenticated', 'authenticated', v_email, crypt('111111', gen_salt('bf')),
            NOW(), v_phone, NOW(), 
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Président / Administrateur', 'phone', v_phone, 'organization', 'Présidence de la République'),
            NOW(), NOW()
        ) RETURNING id INTO v_admin_id;
        
        RAISE NOTICE '✅ Admin (Président) créé avec ID: %', v_admin_id;
    ELSE
        RAISE NOTICE '⚠️  Admin (Président) existe déjà avec ID: %', v_admin_id;
    END IF;

    -- Créer le profil
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
    VALUES (v_admin_id, v_email, 'Président / Administrateur', v_phone, 'Présidence de la République', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();

    -- Assigner le rôle admin
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_admin_id, 'admin', NOW())
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
END $$;

-- =====================================================
-- 2. SOUS-ADMIN DGSS - +24177888002 / PIN: 222222
-- =====================================================

DO $$
DECLARE
    v_sub_admin_dgss_id uuid;
    v_phone TEXT := '+24177888002';
    v_email TEXT := '24177888002@ndjobi.com';
BEGIN
    SELECT id INTO v_sub_admin_dgss_id FROM auth.users WHERE email = v_email;
    IF v_sub_admin_dgss_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('222222', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Sous-Admin DGSS', 'phone', v_phone, 'organization', 'Direction Générale de la Sécurité des Systèmes d''Information'), NOW(), NOW()) RETURNING id INTO v_sub_admin_dgss_id;
        RAISE NOTICE '✅ Sous-Admin DGSS créé avec ID: %', v_sub_admin_dgss_id;
    ELSE
        RAISE NOTICE '⚠️  Sous-Admin DGSS existe déjà avec ID: %', v_sub_admin_dgss_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_sub_admin_dgss_id, v_email, 'Sous-Admin DGSS', v_phone, 'Direction Générale de la Sécurité des Systèmes d''Information', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_sub_admin_dgss_id, 'sub_admin', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'sub_admin';
END $$;

-- =====================================================
-- 3. SOUS-ADMIN DGR - +24177888003 / PIN: 333333
-- =====================================================

DO $$
DECLARE
    v_sub_admin_dgr_id uuid;
    v_phone TEXT := '+24177888003';
    v_email TEXT := '24177888003@ndjobi.com';
BEGIN
    SELECT id INTO v_sub_admin_dgr_id FROM auth.users WHERE email = v_email;
    IF v_sub_admin_dgr_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('333333', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Sous-Admin DGR', 'phone', v_phone, 'organization', 'Direction Générale des Renseignements'), NOW(), NOW()) RETURNING id INTO v_sub_admin_dgr_id;
        RAISE NOTICE '✅ Sous-Admin DGR créé avec ID: %', v_sub_admin_dgr_id;
    ELSE
        RAISE NOTICE '⚠️  Sous-Admin DGR existe déjà avec ID: %', v_sub_admin_dgr_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_sub_admin_dgr_id, v_email, 'Sous-Admin DGR', v_phone, 'Direction Générale des Renseignements', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_sub_admin_dgr_id, 'sub_admin', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'sub_admin';
END $$;

-- =====================================================
-- 4. AGENT DÉFENSE - +24177888004 / PIN: 444444
-- =====================================================

DO $$
DECLARE
    v_agent_defense_id uuid;
    v_phone TEXT := '+24177888004';
    v_email TEXT := '24177888004@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_defense_id FROM auth.users WHERE email = v_email;
    IF v_agent_defense_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('444444', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Agent Défense', 'phone', v_phone, 'organization', 'Ministère de la Défense'), NOW(), NOW()) RETURNING id INTO v_agent_defense_id;
        RAISE NOTICE '✅ Agent Défense créé avec ID: %', v_agent_defense_id;
    ELSE
        RAISE NOTICE '⚠️  Agent Défense existe déjà avec ID: %', v_agent_defense_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_agent_defense_id, v_email, 'Agent Défense', v_phone, 'Ministère de la Défense', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_agent_defense_id, 'agent', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'agent';
END $$;

-- =====================================================
-- 5. AGENT JUSTICE - +24177888005 / PIN: 555555
-- =====================================================

DO $$
DECLARE
    v_agent_justice_id uuid;
    v_phone TEXT := '+24177888005';
    v_email TEXT := '24177888005@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_justice_id FROM auth.users WHERE email = v_email;
    IF v_agent_justice_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('555555', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Agent Justice', 'phone', v_phone, 'organization', 'Ministère de la Justice'), NOW(), NOW()) RETURNING id INTO v_agent_justice_id;
        RAISE NOTICE '✅ Agent Justice créé avec ID: %', v_agent_justice_id;
    ELSE
        RAISE NOTICE '⚠️  Agent Justice existe déjà avec ID: %', v_agent_justice_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_agent_justice_id, v_email, 'Agent Justice', v_phone, 'Ministère de la Justice', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_agent_justice_id, 'agent', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'agent';
END $$;

-- =====================================================
-- 6. AGENT ANTI-CORRUPTION - +24177888006 / PIN: 666666
-- =====================================================

DO $$
DECLARE
    v_agent_lac_id uuid;
    v_phone TEXT := '+24177888006';
    v_email TEXT := '24177888006@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_lac_id FROM auth.users WHERE email = v_email;
    IF v_agent_lac_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('666666', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Agent Anti-Corruption', 'phone', v_phone, 'organization', 'Commission de Lutte Anti-Corruption'), NOW(), NOW()) RETURNING id INTO v_agent_lac_id;
        RAISE NOTICE '✅ Agent Anti-Corruption créé avec ID: %', v_agent_lac_id;
    ELSE
        RAISE NOTICE '⚠️  Agent Anti-Corruption existe déjà avec ID: %', v_agent_lac_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_agent_lac_id, v_email, 'Agent Anti-Corruption', v_phone, 'Commission de Lutte Anti-Corruption', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_agent_lac_id, 'agent', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'agent';
END $$;

-- =====================================================
-- 7. AGENT INTÉRIEUR - +24177888007 / PIN: 777777
-- =====================================================

DO $$
DECLARE
    v_agent_interieur_id uuid;
    v_phone TEXT := '+24177888007';
    v_email TEXT := '24177888007@ndjobi.com';
BEGIN
    SELECT id INTO v_agent_interieur_id FROM auth.users WHERE email = v_email;
    IF v_agent_interieur_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('777777', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Agent Intérieur', 'phone', v_phone, 'organization', 'Ministère de l''Intérieur'), NOW(), NOW()) RETURNING id INTO v_agent_interieur_id;
        RAISE NOTICE '✅ Agent Intérieur créé avec ID: %', v_agent_interieur_id;
    ELSE
        RAISE NOTICE '⚠️  Agent Intérieur existe déjà avec ID: %', v_agent_interieur_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_agent_interieur_id, v_email, 'Agent Intérieur', v_phone, 'Ministère de l''Intérieur', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_agent_interieur_id, 'agent', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'agent';
END $$;

-- =====================================================
-- 8. CITOYEN DÉMO - +24177888008 / PIN: 888888
-- =====================================================

DO $$
DECLARE
    v_citoyen_demo_id uuid;
    v_phone TEXT := '+24177888008';
    v_email TEXT := '24177888008@ndjobi.com';
BEGIN
    SELECT id INTO v_citoyen_demo_id FROM auth.users WHERE email = v_email;
    IF v_citoyen_demo_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('888888', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Citoyen Démo', 'phone', v_phone, 'organization', 'Citoyen'), NOW(), NOW()) RETURNING id INTO v_citoyen_demo_id;
        RAISE NOTICE '✅ Citoyen Démo créé avec ID: %', v_citoyen_demo_id;
    ELSE
        RAISE NOTICE '⚠️  Citoyen Démo existe déjà avec ID: %', v_citoyen_demo_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_citoyen_demo_id, v_email, 'Citoyen Démo', v_phone, 'Citoyen', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_citoyen_demo_id, 'user', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'user';
END $$;

-- =====================================================
-- 9. CITOYEN ANONYME - +24177888009 / PIN: 999999
-- =====================================================

DO $$
DECLARE
    v_citoyen_anonyme_id uuid;
    v_phone TEXT := '+24177888009';
    v_email TEXT := '24177888009@ndjobi.com';
BEGIN
    SELECT id INTO v_citoyen_anonyme_id FROM auth.users WHERE email = v_email;
    IF v_citoyen_anonyme_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email, crypt('999999', gen_salt('bf')), NOW(), v_phone, NOW(), '{"provider":"phone","providers":["phone"]}', jsonb_build_object('full_name', 'Citoyen Anonyme', 'phone', v_phone, 'organization', 'Anonyme'), NOW(), NOW()) RETURNING id INTO v_citoyen_anonyme_id;
        RAISE NOTICE '✅ Citoyen Anonyme créé avec ID: %', v_citoyen_anonyme_id;
    ELSE
        RAISE NOTICE '⚠️  Citoyen Anonyme existe déjà avec ID: %', v_citoyen_anonyme_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at) VALUES (v_citoyen_anonyme_id, v_email, 'Citoyen Anonyme', v_phone, 'Anonyme', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, organization = EXCLUDED.organization, updated_at = NOW();
    INSERT INTO public.user_roles (user_id, role, created_at) VALUES (v_citoyen_anonyme_id, 'user', NOW()) ON CONFLICT (user_id) DO UPDATE SET role = 'user';
END $$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

SELECT 
    'Vérification finale - Tous les comptes créés' as status,
    ur.role AS "Rôle",
    p.full_name AS "Nom",
    p.phone AS "Téléphone",
    p.organization AS "Organisation",
    u.email AS "Email",
    u.created_at AS "Date création"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com'
ORDER BY 
    CASE ur.role
        WHEN 'admin' THEN 1
        WHEN 'sub_admin' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'user' THEN 4
    END,
    p.organization;
