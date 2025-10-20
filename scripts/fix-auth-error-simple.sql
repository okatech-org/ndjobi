-- ============================================
-- FIX RAPIDE: Database error querying schema
-- À EXÉCUTER DANS SUPABASE SQL EDITOR
-- ============================================

-- ÉTAPE 1: Activer l'extension pgcrypto (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ÉTAPE 2: Corriger la contrainte UNIQUE sur user_roles
-- Supprimer l'ancienne contrainte qui permet plusieurs rôles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Nettoyer les doublons (garder le rôle le plus élevé)
DELETE FROM public.user_roles ur1
WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur1.user_id = ur2.user_id
    AND ur1.id > ur2.id
);

-- Ajouter la contrainte UNIQUE sur user_id seulement
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- ÉTAPE 3: Recréer les fonctions de sécurité
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

-- ÉTAPE 4: Vérifier/Créer le compte admin
DO $$
DECLARE
    v_admin_id UUID;
    v_admin_email TEXT := '24177888001@ndjobi.com';
    v_admin_phone TEXT := '+24177888001';
BEGIN
    -- Chercher le compte
    SELECT id INTO v_admin_id 
    FROM auth.users 
    WHERE email = v_admin_email;
    
    IF v_admin_id IS NOT NULL THEN
        -- Mettre à jour le mot de passe
        UPDATE auth.users
        SET 
            encrypted_password = crypt('111111', gen_salt('bf')),
            email_confirmed_at = NOW(),
            phone_confirmed_at = NOW()
        WHERE id = v_admin_id;
        
        -- Créer/Mettre à jour le profil
        INSERT INTO public.profiles (id, email, full_name, phone, organization)
        VALUES (
            v_admin_id,
            v_admin_email,
            'Président de la République',
            v_admin_phone,
            'Présidence de la République'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            updated_at = NOW();
        
        -- Assigner le rôle (un seul!)
        DELETE FROM public.user_roles WHERE user_id = v_admin_id;
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_admin_id, 'admin'::app_role);
        
        RAISE NOTICE '✅ Compte admin corrigé - PIN: 111111';
    ELSE
        RAISE NOTICE '❌ Compte admin non trouvé. Créez-le d''abord dans Supabase Auth.';
    END IF;
END $$;

-- ÉTAPE 5: Afficher un résumé
SELECT 
    'Compte Admin' as info,
    u.email,
    u.phone,
    p.full_name,
    ur.role,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'Confirmé'
        ELSE 'Non confirmé'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888001@ndjobi.com';

