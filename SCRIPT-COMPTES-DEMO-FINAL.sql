-- Script pour créer les 9 comptes démo NDJOBI
-- Copiez-collez ce script dans le SQL Editor de Supabase

-- Désactiver temporairement RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Créer les comptes démo
DO $$
DECLARE
    v_user_id uuid;
    v_accounts text[][] := ARRAY[
        ['24177888001@ndjobi.com', '+24177888001', '111111', 'Président / Administrateur', 'Présidence de la République', 'admin'],
        ['24177888002@ndjobi.com', '+24177888002', '222222', 'Sous-Admin DGSS', 'Direction Générale de la Sécurité des Systèmes d''Information', 'sub_admin'],
        ['24177888003@ndjobi.com', '+24177888003', '333333', 'Sous-Admin DGR', 'Direction Générale des Renseignements', 'sub_admin'],
        ['24177888004@ndjobi.com', '+24177888004', '444444', 'Agent Défense', 'Ministère de la Défense', 'agent'],
        ['24177888005@ndjobi.com', '+24177888005', '555555', 'Agent Justice', 'Ministère de la Justice', 'agent'],
        ['24177888006@ndjobi.com', '+24177888006', '666666', 'Agent Anti-Corruption', 'Commission de Lutte Anti-Corruption', 'agent'],
        ['24177888007@ndjobi.com', '+24177888007', '777777', 'Agent Intérieur', 'Ministère de l''Intérieur', 'agent'],
        ['24177888008@ndjobi.com', '+24177888008', '888888', 'Citoyen Démo', 'Citoyen', 'user'],
        ['24177888009@ndjobi.com', '+24177888009', '999999', 'Citoyen Anonyme', 'Anonyme', 'user']
    ];
    v_account text[];
BEGIN
    RAISE NOTICE 'Démarrage de la création des comptes démo...';
    
    FOREACH v_account SLICE 1 IN ARRAY v_accounts
    LOOP
        -- Générer un UUID
        v_user_id := gen_random_uuid();
        
        -- Insérer dans auth.users
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, phone, phone_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
            v_account[1], crypt(v_account[3], gen_salt('bf')), NOW(), v_account[2], NOW(),
            '{"provider":"phone","providers":["phone"]}'::jsonb,
            jsonb_build_object('full_name', v_account[4], 'phone', v_account[2], 'organization', v_account[5]),
            NOW(), NOW()
        );
        
        -- Insérer dans public.profiles
        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (v_user_id, v_account[1], v_account[4], v_account[2], v_account[5], NOW(), NOW());
        
        -- Insérer dans public.user_roles
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_user_id, v_account[6]::app_role, NOW());
        
        RAISE NOTICE 'Compte créé: % (% - PIN: %)', v_account[4], v_account[1], v_account[3];
    END LOOP;
    
    RAISE NOTICE 'Création terminée !';
END $$;

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
    u.email, p.full_name, p.phone, ur.role, p.organization
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com'
ORDER BY u.created_at;
