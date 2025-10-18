-- Migration 2: Création des comptes démo
-- 1. ADMIN (Président)
DO $$
DECLARE v_id uuid;
BEGIN
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888001@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888001@ndjobi.com', crypt('111111', gen_salt('bf')), NOW(), '+24177888001', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Président', 'phone', '+24177888001', 'role_type', 'president'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888001@ndjobi.com', 'Président', '+24177888001', 'Présidence',
        jsonb_build_object('role_type', 'president'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888001', organization = 'Présidence',
        metadata = jsonb_build_object('role_type', 'president');
    
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- 2-3. SOUS-ADMINS
DO $$
DECLARE v_id uuid;
BEGIN
    -- DGSS
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888002@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888002@ndjobi.com', crypt('222222', gen_salt('bf')), NOW(), '+24177888002', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Sous-Admin DGSS', 'phone', '+24177888002', 'role_type', 'sub_admin_dgss'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888002@ndjobi.com', 'Sous-Admin DGSS', '+24177888002', 'DGSS',
        jsonb_build_object('role_type', 'sub_admin_dgss', 'department', 'security'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888002', organization = 'DGSS';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'sub_admin') ON CONFLICT (user_id, role) DO NOTHING;
    
    -- DGR
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888003@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888003@ndjobi.com', crypt('333333', gen_salt('bf')), NOW(), '+24177888003', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Sous-Admin DGR', 'phone', '+24177888003', 'role_type', 'sub_admin_dgr'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888003@ndjobi.com', 'Sous-Admin DGR', '+24177888003', 'DGR',
        jsonb_build_object('role_type', 'sub_admin_dgr', 'department', 'intelligence'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888003', organization = 'DGR';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'sub_admin') ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- 4-7. AGENTS
DO $$
DECLARE v_id uuid;
BEGIN
    -- Agent Défense
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888004@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888004@ndjobi.com', crypt('444444', gen_salt('bf')), NOW(), '+24177888004', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Agent Défense', 'phone', '+24177888004', 'ministry', 'defense'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888004@ndjobi.com', 'Agent Défense', '+24177888004', 'Min. Défense',
        jsonb_build_object('ministry', 'defense'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888004';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'agent') ON CONFLICT (user_id, role) DO NOTHING;

    -- Agent Justice
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888005@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888005@ndjobi.com', crypt('555555', gen_salt('bf')), NOW(), '+24177888005', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Agent Justice', 'phone', '+24177888005', 'ministry', 'justice'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888005@ndjobi.com', 'Agent Justice', '+24177888005', 'Min. Justice',
        jsonb_build_object('ministry', 'justice'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888005';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'agent') ON CONFLICT (user_id, role) DO NOTHING;

    -- Agent Anti-Corruption
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888006@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888006@ndjobi.com', crypt('666666', gen_salt('bf')), NOW(), '+24177888006', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Agent Anti-Corruption', 'phone', '+24177888006', 'ministry', 'anti_corruption'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888006@ndjobi.com', 'Agent Anti-Corruption', '+24177888006', 'Commission LAC',
        jsonb_build_object('ministry', 'anti_corruption'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888006';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'agent') ON CONFLICT (user_id, role) DO NOTHING;

    -- Agent Intérieur
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888007@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888007@ndjobi.com', crypt('777777', gen_salt('bf')), NOW(), '+24177888007', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Agent Intérieur', 'phone', '+24177888007', 'ministry', 'interior'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
    VALUES (v_id, '24177888007@ndjobi.com', 'Agent Intérieur', '+24177888007', 'Min. Intérieur',
        jsonb_build_object('ministry', 'interior'))
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888007';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'agent') ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- 8-9. CITOYENS
DO $$
DECLARE v_id uuid;
BEGIN
    -- Citoyen
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888008@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888008@ndjobi.com', crypt('888888', gen_salt('bf')), NOW(), '+24177888008', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Citoyen Démo', 'phone', '+24177888008'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone) VALUES (v_id, '24177888008@ndjobi.com', 'Citoyen Démo', '+24177888008')
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888008';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'user') ON CONFLICT (user_id, role) DO NOTHING;

    -- Citoyen Anonyme
    SELECT id INTO v_id FROM auth.users WHERE email = '24177888009@ndjobi.com';
    IF v_id IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            '24177888009@ndjobi.com', crypt('999999', gen_salt('bf')), NOW(), '+24177888009', NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object('full_name', 'Citoyen Anonyme', 'phone', '+24177888009'),
            NOW(), NOW(), '', '') RETURNING id INTO v_id;
    END IF;
    INSERT INTO public.profiles (id, email, full_name, phone) VALUES (v_id, '24177888009@ndjobi.com', 'Citoyen Anonyme', '+24177888009')
    ON CONFLICT (id) DO UPDATE SET phone = '+24177888009';
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'user') ON CONFLICT (user_id, role) DO NOTHING;
END $$;