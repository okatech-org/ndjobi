-- Migration de correction pour le compte Président
-- Vérifie et corrige le compte +24177888001 (Président)

-- 1. Vérifier et créer les fonctions RPC si elles n'existent pas

-- Fonction has_role (vérifie si un utilisateur a un rôle spécifique)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- Fonction get_user_role (récupère le rôle le plus élevé d'un utilisateur)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 4
      WHEN 'admin' THEN 3
      WHEN 'agent' THEN 2
      WHEN 'user' THEN 1
    END DESC
  LIMIT 1;
$$;

-- Fonction is_president (vérifie si un utilisateur est président)
CREATE OR REPLACE FUNCTION public.is_president(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'admin'::app_role
  );
$$;

-- 2. Vérifier et corriger le compte Président
DO $$
DECLARE
    v_president_id uuid;
    v_president_email TEXT := '24177888001@ndjobi.com';
    v_president_phone TEXT := '+24177888001';
BEGIN
    -- Récupérer l'ID du compte Président
    SELECT id INTO v_president_id
    FROM auth.users
    WHERE email = v_president_email OR phone = v_president_phone;

    IF v_president_id IS NOT NULL THEN
        -- Mettre à jour le profil
        INSERT INTO public.profiles (id, email, full_name, phone, organization, metadata)
        VALUES (
            v_president_id,
            v_president_email,
            'Président de la République',
            v_president_phone,
            'Présidence de la République',
            jsonb_build_object(
                'role_type', 'president',
                'department', 'Présidence',
                'access_level', 'full'
            )
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            organization = EXCLUDED.organization,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();

        -- S'assurer que le rôle admin est assigné
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_president_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;

        RAISE NOTICE '✅ Compte Président corrigé: %', v_president_id;
        RAISE NOTICE 'Email: %', v_president_email;
        RAISE NOTICE 'Téléphone: %', v_president_phone;
        RAISE NOTICE 'Rôle: admin (Président)';
    ELSE
        RAISE NOTICE '⚠️  Compte Président non trouvé. Il doit être créé via l''inscription.';
    END IF;
END $$;

-- 3. Vérification finale
SELECT 
    '✅ Vérification Compte Président' as statut,
    u.email,
    u.phone,
    p.full_name,
    p.organization,
    ur.role,
    p.metadata->>'role_type' as role_type
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888001@ndjobi.com' OR u.phone = '+24177888001';