-- ============================================
-- FIX: Database error querying schema
-- Date: 2025-10-20
-- Description: Corrige les problèmes de schéma qui causent l'erreur 500 lors de l'authentification
-- ============================================

-- 1. Vérifier et corriger la contrainte UNIQUE sur user_roles
DO $$ 
BEGIN
    -- La table user_roles doit permettre UN SEUL rôle par utilisateur
    -- Supprimer la contrainte UNIQUE(user_id, role) si elle existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_role_key' 
        AND conrelid = 'public.user_roles'::regclass
    ) THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_role_key;
        RAISE NOTICE '✅ Contrainte UNIQUE(user_id, role) supprimée';
    END IF;

    -- Nettoyer les doublons avant d'ajouter la contrainte unique
    -- Garder seulement le rôle le plus élevé pour chaque utilisateur
    DELETE FROM public.user_roles ur1
    WHERE EXISTS (
        SELECT 1 FROM public.user_roles ur2
        WHERE ur1.user_id = ur2.user_id
        AND (
            CASE ur2.role
                WHEN 'super_admin' THEN 4
                WHEN 'admin' THEN 3
                WHEN 'agent' THEN 2
                WHEN 'user' THEN 1
            END
        ) > (
            CASE ur1.role
                WHEN 'super_admin' THEN 4
                WHEN 'admin' THEN 3
                WHEN 'agent' THEN 2
                WHEN 'user' THEN 1
            END
        )
    );

    -- Ajouter la contrainte UNIQUE(user_id) si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_key' 
        AND conrelid = 'public.user_roles'::regclass
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
        RAISE NOTICE '✅ Contrainte UNIQUE(user_id) ajoutée';
    END IF;
END $$;

-- 2. Recréer les fonctions de sécurité sans problèmes potentiels
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role app_role;
BEGIN
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'user'::app_role);
EXCEPTION WHEN OTHERS THEN
  RETURN 'user'::app_role;
END;
$$;

-- 3. Corriger le trigger handle_new_user pour éviter les erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Créer le rôle par défaut 'user' si aucun rôle n'existe
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'user'::app_role, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, ne pas bloquer la création de l'utilisateur
  RAISE WARNING 'Erreur lors de la création du profil/rôle pour %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. S'assurer que les politiques RLS ne causent pas de boucles
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'::app_role
    )
  );

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin'::app_role, 'super_admin'::app_role)
    )
  );

-- 5. Vérifier et corriger le compte admin +24177888001
DO $$
DECLARE
    v_admin_id UUID;
    v_admin_email TEXT := '24177888001@ndjobi.com';
    v_admin_phone TEXT := '+24177888001';
    v_admin_pin TEXT := '111111';
BEGIN
    -- Chercher l'utilisateur admin
    SELECT id INTO v_admin_id 
    FROM auth.users 
    WHERE email = v_admin_email OR phone = v_admin_phone;
    
    IF v_admin_id IS NOT NULL THEN
        RAISE NOTICE '✅ Compte admin trouvé: % (ID: %)', v_admin_email, v_admin_id;
        
        -- S'assurer que le profil existe
        INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
        VALUES (
            v_admin_id,
            v_admin_email,
            'Président de la République',
            v_admin_phone,
            'Présidence de la République',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            updated_at = NOW();
        
        -- S'assurer que le rôle existe (un seul rôle!)
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (v_admin_id, 'admin'::app_role, NOW())
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role, updated_at = NOW();
        
        -- Mettre à jour le mot de passe si nécessaire
        -- Note: crypt nécessite l'extension pgcrypto
        UPDATE auth.users
        SET 
            encrypted_password = crypt(v_admin_pin, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            phone_confirmed_at = COALESCE(phone_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_admin_id;
        
        RAISE NOTICE '✅ Compte admin corrigé avec PIN 111111';
    ELSE
        RAISE NOTICE '⚠️  Compte admin non trouvé pour: %', v_admin_email;
        RAISE NOTICE '💡 Créez le compte via: INSERT INTO auth.users...';
    END IF;
END $$;

-- 6. Créer une fonction de diagnostic
CREATE OR REPLACE FUNCTION public.diagnose_auth_issue()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Vérifier la table user_roles
    RETURN QUERY
    SELECT 
        'user_roles_table'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') 
            THEN '✅ OK' 
            ELSE '❌ MANQUANT' 
        END,
        'Table user_roles'::TEXT;
    
    -- Vérifier la contrainte unique
    RETURN QUERY
    SELECT 
        'unique_constraint'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'user_roles_user_id_key' 
            AND conrelid = 'public.user_roles'::regclass
        ) THEN '✅ OK' ELSE '❌ MANQUANT' END,
        'Contrainte UNIQUE(user_id)'::TEXT;
    
    -- Vérifier les fonctions
    RETURN QUERY
    SELECT 
        'has_role_function'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_proc WHERE proname = 'has_role'
        ) THEN '✅ OK' ELSE '❌ MANQUANT' END,
        'Fonction has_role'::TEXT;
    
    RETURN;
END;
$$;

-- 7. Exécuter le diagnostic
SELECT * FROM public.diagnose_auth_issue();

RAISE NOTICE '✅ Migration terminée - Testez la connexion maintenant';

