-- Script pour créer le compte admin s'il n'existe pas
-- À exécuter dans le SQL Editor de Supabase

DO $$
DECLARE
    v_admin_id UUID;
    v_admin_email TEXT := '24177888001@ndjobi.com';
    v_admin_phone TEXT := '+24177888001';
    v_admin_pin TEXT := '111111';
    v_full_name TEXT := 'Président de la République';
    v_organization TEXT := 'Présidence de la République';
BEGIN
    -- Vérifier si le compte existe déjà
    SELECT id INTO v_admin_id 
    FROM auth.users 
    WHERE email = v_admin_email OR phone = v_admin_phone;
    
    IF v_admin_id IS NULL THEN
        -- Le compte n'existe pas, le créer
        RAISE NOTICE '📝 Création du compte admin...';
        
        -- 1. Créer l'utilisateur dans auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            phone_confirmed_at,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            aud,
            role
        )
        VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            v_admin_email,
            crypt(v_admin_pin, gen_salt('bf')),
            NOW(),
            v_admin_phone,
            NOW(),
            jsonb_build_object(
                'full_name', v_full_name,
                'phone', v_admin_phone,
                'organization', v_organization,
                'role', 'admin'
            ),
            NOW(),
            NOW(),
            '',
            'authenticated',
            'authenticated'
        )
        RETURNING id INTO v_admin_id;
        
        RAISE NOTICE '✅ Utilisateur créé avec ID: %', v_admin_id;
        
        -- 2. Créer le profil
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
            v_admin_id,
            v_admin_email,
            v_full_name,
            v_admin_phone,
            v_organization,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Profil créé';
        
        -- 3. Attribuer le rôle admin
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_admin_id, 'admin'::app_role, NOW());
        
        RAISE NOTICE '✅ Rôle admin attribué';
        
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS';
        RAISE NOTICE 'Email: %', v_admin_email;
        RAISE NOTICE 'Téléphone: %', v_admin_phone;
        RAISE NOTICE 'PIN: %', v_admin_pin;
        RAISE NOTICE '========================================';
    ELSE
        -- Le compte existe déjà
        RAISE NOTICE '✅ Compte admin existe déjà (ID: %)', v_admin_id;
        
        -- Mettre à jour le mot de passe au cas où
        UPDATE auth.users
        SET 
            encrypted_password = crypt(v_admin_pin, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            phone_confirmed_at = COALESCE(phone_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_admin_id;
        
        -- S'assurer que le profil existe
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
            v_admin_id,
            v_admin_email,
            v_full_name,
            v_admin_phone,
            v_organization,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            updated_at = NOW();
        
        -- S'assurer que le rôle existe
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_admin_id, 'admin'::app_role, NOW())
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role, updated_at = NOW();
        
        RAISE NOTICE '✅ Compte admin mis à jour avec PIN: %', v_admin_pin;
    END IF;
    
    -- Afficher le résumé final
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INFORMATIONS DE CONNEXION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Téléphone: %', v_admin_phone;
    RAISE NOTICE 'PIN: %', v_admin_pin;
    RAISE NOTICE 'Email (interne): %', v_admin_email;
    RAISE NOTICE '========================================';
    
END $$;

