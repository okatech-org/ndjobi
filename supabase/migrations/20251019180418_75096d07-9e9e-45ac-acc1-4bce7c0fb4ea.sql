-- Migration des comptes administrateurs et agents manquants
-- Corrige les sous-administrateurs DGSS et DGR + Ajoute Agent Pêche

-- 1. Correction Sous-administrateur DGSS (+24177888002)
DO $$
DECLARE
    v_dgss_id uuid;
    v_dgss_email TEXT := '24177888002@ndjobi.com';
    v_dgss_phone TEXT := '+24177888002';
BEGIN
    SELECT id INTO v_dgss_id
    FROM auth.users
    WHERE email = v_dgss_email OR phone = v_dgss_phone;

    IF v_dgss_id IS NOT NULL THEN
        -- Mettre à jour le profil DGSS
        INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
        VALUES (
            v_dgss_id,
            v_dgss_email,
            'Sous-Admin DGSS',
            v_dgss_phone,
            'Direction Générale de la Sécurité et de la Surveillance',
            jsonb_build_object(
                'role_type', 'sub_admin_dgss',
                'department', 'DGSS',
                'access_level', 'sectoral'
            )
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();

        -- Assigner le rôle admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_dgss_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;

        RAISE NOTICE '✅ Sous-Admin DGSS corrigé: %', v_dgss_id;
    ELSE
        RAISE NOTICE '⚠️  Compte DGSS non trouvé en auth.users';
    END IF;
END $$;

-- 2. Correction Sous-administrateur DGR (+24177888003)
DO $$
DECLARE
    v_dgr_id uuid;
    v_dgr_email TEXT := '24177888003@ndjobi.com';
    v_dgr_phone TEXT := '+24177888003';
BEGIN
    SELECT id INTO v_dgr_id
    FROM auth.users
    WHERE email = v_dgr_email OR phone = v_dgr_phone;

    IF v_dgr_id IS NOT NULL THEN
        -- Mettre à jour le profil DGR
        INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
        VALUES (
            v_dgr_id,
            v_dgr_email,
            'Sous-Admin DGR',
            v_dgr_phone,
            'Direction Générale des Renseignements',
            jsonb_build_object(
                'role_type', 'sub_admin_dgr',
                'department', 'DGR',
                'access_level', 'sectoral'
            )
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();

        -- Assigner le rôle admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_dgr_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;

        RAISE NOTICE '✅ Sous-Admin DGR corrigé: %', v_dgr_id;
    ELSE
        RAISE NOTICE '⚠️  Compte DGR non trouvé en auth.users';
    END IF;
END $$;

-- 3. Ajout du nouveau compte Agent Pêche (+24177888010)
DO $$
DECLARE
    v_peche_id uuid;
    v_peche_email TEXT := '24177888010@ndjobi.com';
    v_peche_phone TEXT := '+24177888010';
BEGIN
    SELECT id INTO v_peche_id
    FROM auth.users
    WHERE email = v_peche_email OR phone = v_peche_phone;

    IF v_peche_id IS NOT NULL THEN
        -- Créer/Mettre à jour le profil Agent Pêche
        INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
        VALUES (
            v_peche_id,
            v_peche_email,
            'Agent Pêche',
            v_peche_phone,
            'Ministère de la Mer de la Pêche et de l''Économie Bleue',
            jsonb_build_object(
                'ministry', 'Pêche',
                'department', 'Économie Bleue',
                'access_level', 'agent'
            )
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();

        -- Assigner le rôle agent
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_peche_id, 'agent'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;

        RAISE NOTICE '✅ Agent Pêche créé: %', v_peche_id;
    ELSE
        RAISE NOTICE '⚠️  Compte Agent Pêche non trouvé en auth.users';
    END IF;
END $$;

-- 4. Vérification finale de tous les comptes migrés
SELECT 
    '✅ Vérification Comptes Migrés' as statut,
    u.email,
    u.phone,
    p.full_name,
    p.organization,
    ur.role,
    p.metadata->>'role_type' as role_type
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN (
    '24177888002@ndjobi.com',
    '24177888003@ndjobi.com',
    '24177888010@ndjobi.com'
)
ORDER BY u.email;