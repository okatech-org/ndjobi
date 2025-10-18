-- Script SQL pour créer les comptes démo manuellement
-- À exécuter dans le SQL Editor de Supabase
-- Copiez-collez ce script dans l'éditeur SQL de votre dashboard Supabase

-- Désactiver temporairement RLS pour permettre la création
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- CRÉATION DES COMPTES DÉMO
-- =====================================================

DO $$
DECLARE
    v_user_id uuid;
    v_accounts jsonb := '[
        {
            "email": "24177888001@ndjobi.com",
            "phone": "+24177888001",
            "pin": "111111",
            "full_name": "Président / Administrateur",
            "organization": "Présidence de la République",
            "role": "admin"
        },
        {
            "email": "24177888002@ndjobi.com",
            "phone": "+24177888002",
            "pin": "222222",
            "full_name": "Sous-Admin DGSS",
            "organization": "Direction Générale de la Sécurité des Systèmes d''Information",
            "role": "sub_admin"
        },
        {
            "email": "24177888003@ndjobi.com",
            "phone": "+24177888003",
            "pin": "333333",
            "full_name": "Sous-Admin DGR",
            "organization": "Direction Générale des Renseignements",
            "role": "sub_admin"
        },
        {
            "email": "24177888004@ndjobi.com",
            "phone": "+24177888004",
            "pin": "444444",
            "full_name": "Agent Défense",
            "organization": "Ministère de la Défense",
            "role": "agent"
        },
        {
            "email": "24177888005@ndjobi.com",
            "phone": "+24177888005",
            "pin": "555555",
            "full_name": "Agent Justice",
            "organization": "Ministère de la Justice",
            "role": "agent"
        },
        {
            "email": "24177888006@ndjobi.com",
            "phone": "+24177888006",
            "pin": "666666",
            "full_name": "Agent Anti-Corruption",
            "organization": "Commission de Lutte Anti-Corruption",
            "role": "agent"
        },
        {
            "email": "24177888007@ndjobi.com",
            "phone": "+24177888007",
            "pin": "777777",
            "full_name": "Agent Intérieur",
            "organization": "Ministère de l''Intérieur",
            "role": "agent"
        },
        {
            "email": "24177888008@ndjobi.com",
            "phone": "+24177888008",
            "pin": "888888",
            "full_name": "Citoyen Démo",
            "organization": "Citoyen",
            "role": "user"
        },
        {
            "email": "24177888009@ndjobi.com",
            "phone": "+24177888009",
            "pin": "999999",
            "full_name": "Citoyen Anonyme",
            "organization": "Anonyme",
            "role": "user"
        }
    ]'::jsonb;
    v_account jsonb;
BEGIN
    RAISE NOTICE '--- Démarrage de la création des comptes démo ---';
    
    -- Parcourir chaque compte
    FOR v_account IN SELECT * FROM jsonb_array_elements(v_accounts)
    LOOP
        RAISE NOTICE 'Création du compte: %', v_account->>'email';
        
        -- Générer un UUID pour l'utilisateur
        v_user_id := gen_random_uuid();
        
        -- Insérer dans auth.users
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
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            v_account->>'email',
            crypt(v_account->>'pin', gen_salt('bf')),
            NOW(),
            v_account->>'phone',
            NOW(),
            '{"provider":"phone","providers":["phone"]}'::jsonb,
            jsonb_build_object(
                'full_name', v_account->>'full_name',
                'phone', v_account->>'phone',
                'organization', v_account->>'organization'
            ),
            NOW(),
            NOW()
        );
        
        -- Insérer dans public.profiles
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            phone,
            organization,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            v_account->>'email',
            v_account->>'full_name',
            v_account->>'phone',
            v_account->>'organization',
            NOW(),
            NOW()
        );
        
        -- Insérer dans public.user_roles
        INSERT INTO public.user_roles (
            user_id,
            role,
            created_at
        ) VALUES (
            v_user_id,
            (v_account->>'role')::app_role,
            NOW()
        );
        
        RAISE NOTICE '✅ Compte créé: % (% - PIN: %)', 
            v_account->>'full_name', 
            v_account->>'email', 
            v_account->>'pin';
    END LOOP;
    
    RAISE NOTICE '--- Création terminée ---';
    RAISE NOTICE 'Total de comptes créés: %', jsonb_array_length(v_accounts);
    
END $$;

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Vérification finale
SELECT 
    'VÉRIFICATION FINALE' as status,
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    p.organization
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com'
ORDER BY u.created_at DESC;
