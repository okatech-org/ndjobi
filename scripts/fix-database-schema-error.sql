-- ============================================
-- FIX: Database error querying schema
-- Date: 2025-10-20
-- ============================================

-- 1. Vérifier la structure de user_roles
DO $$ 
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC user_roles ===';
END $$;

-- 2. Analyser les contraintes existantes
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'user_roles';

-- 3. Corriger la contrainte UNIQUE si nécessaire
-- Le problème: la table user_roles pourrait avoir UNIQUE(user_id, role)
-- alors qu'on ne devrait avoir qu'UN seul rôle par user (UNIQUE(user_id))

DO $$ 
BEGIN
    -- Supprimer l'ancienne contrainte UNIQUE (user_id, role) si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_role_key' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_role_key;
        RAISE NOTICE 'Contrainte UNIQUE(user_id, role) supprimée';
    END IF;

    -- Ajouter la contrainte UNIQUE(user_id) si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_key' 
        AND table_name = 'user_roles'
    ) THEN
        -- Nettoyer les doublons avant d'ajouter la contrainte
        DELETE FROM public.user_roles ur1
        WHERE EXISTS (
            SELECT 1 FROM public.user_roles ur2
            WHERE ur1.user_id = ur2.user_id
            AND ur1.id > ur2.id
        );
        
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Contrainte UNIQUE(user_id) ajoutée';
    END IF;
END $$;

-- 4. Vérifier que le compte admin existe
DO $$ 
DECLARE
    v_admin_id UUID;
    v_admin_email TEXT := '24177888001@ndjobi.com';
BEGIN
    -- Chercher l'utilisateur admin
    SELECT id INTO v_admin_id 
    FROM auth.users 
    WHERE email = v_admin_email;
    
    IF v_admin_id IS NOT NULL THEN
        RAISE NOTICE 'Compte admin trouvé: % (ID: %)', v_admin_email, v_admin_id;
        
        -- Vérifier le rôle
        IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_admin_id) THEN
            RAISE NOTICE 'Rôle admin déjà défini';
        ELSE
            -- Créer le rôle admin
            INSERT INTO public.user_roles (user_id, role)
            VALUES (v_admin_id, 'admin')
            ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();
            RAISE NOTICE 'Rôle admin créé';
        END IF;
        
        -- Vérifier le profil
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id) THEN
            RAISE NOTICE 'Profil admin existe';
        ELSE
            -- Créer le profil
            INSERT INTO public.profiles (id, email, full_name, organization)
            VALUES (
                v_admin_id, 
                v_admin_email,
                'Président de la République',
                'Présidence de la République'
            );
            RAISE NOTICE 'Profil admin créé';
        END IF;
    ELSE
        RAISE NOTICE 'ATTENTION: Compte admin non trouvé pour: %', v_admin_email;
        RAISE NOTICE 'Vous devez créer le compte via Supabase Auth d''abord';
    END IF;
END $$;

-- 5. Vérifier les politiques RLS sur user_roles
DO $$ 
BEGIN
    RAISE NOTICE '=== POLITIQUES RLS user_roles ===';
END $$;

SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'user_roles';

-- 6. S'assurer que les fonctions de sécurité existent
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

RAISE NOTICE '=== FIX TERMINÉ ===';

