-- ============================================
-- SCRIPT DE RÉINITIALISATION COMPLÈTE
-- ============================================
-- Exécuter dans Supabase Studio SQL Editor
-- http://127.0.0.1:54323/project/default/editor

-- 1. Nettoyer les anciens comptes démo
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@ndjobi.ga'
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@ndjobi.ga'
);

-- Note: On ne peut pas supprimer directement dans auth.users via SQL
-- Les comptes seront écrasés lors de la recréation

-- 2. Créer/Mettre à jour la fonction RPC
CREATE OR REPLACE FUNCTION public.ensure_demo_user_role(
  _user_id UUID,
  _role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer l'ancien rôle
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Ajouter le nouveau rôle
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_user_id, _role)
  ON CONFLICT (user_id) DO UPDATE SET role = _role;
  
  -- Créer/mettre à jour le profil
  INSERT INTO public.profiles (id, username, email)
  SELECT 
    _user_id,
    CASE _role
      WHEN 'super_admin' THEN 'Super Admin'
      WHEN 'admin' THEN 'Admin'
      WHEN 'agent' THEN 'Agent DGSS'
      ELSE 'Citoyen'
    END,
    email
  FROM auth.users 
  WHERE id = _user_id
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      updated_at = NOW();
  
  RAISE NOTICE 'Rôle % assigné à l''utilisateur %', _role, _user_id;
END;
$$;

-- 3. Donner les permissions
GRANT EXECUTE ON FUNCTION public.ensure_demo_user_role TO anon, authenticated;

-- 4. Créer les tables manquantes si nécessaire
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  fingerprint_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Activer RLS si nécessaire
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour device_sessions
DROP POLICY IF EXISTS "device_sessions_insert" ON public.device_sessions;
CREATE POLICY "device_sessions_insert" ON public.device_sessions
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "device_sessions_select" ON public.device_sessions;
CREATE POLICY "device_sessions_select" ON public.device_sessions
FOR SELECT USING (true);

DROP POLICY IF EXISTS "device_sessions_update" ON public.device_sessions;
CREATE POLICY "device_sessions_update" ON public.device_sessions
FOR UPDATE USING (true);

-- 7. Assigner manuellement les rôles aux comptes existants
DO $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Super Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777000@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    PERFORM public.ensure_demo_user_role(v_user_id, 'super_admin');
    v_count := v_count + 1;
    RAISE NOTICE '✅ Super Admin configuré';
  END IF;

  -- Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777003@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    PERFORM public.ensure_demo_user_role(v_user_id, 'admin');
    v_count := v_count + 1;
    RAISE NOTICE '✅ Admin configuré';
  END IF;

  -- Agent
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777002@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    PERFORM public.ensure_demo_user_role(v_user_id, 'agent');
    v_count := v_count + 1;
    RAISE NOTICE '✅ Agent configuré';
  END IF;

  -- Citoyen
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777001@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    PERFORM public.ensure_demo_user_role(v_user_id, 'user');
    v_count := v_count + 1;
    RAISE NOTICE '✅ Citoyen configuré';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Total : % comptes configurés', v_count;
  RAISE NOTICE '================================';
  
  IF v_count = 0 THEN
    RAISE NOTICE '⚠️ AUCUN COMPTE TROUVÉ !';
    RAISE NOTICE 'Créez d''abord les comptes en cliquant sur les boutons démo';
    RAISE NOTICE 'ou exécutez le script quick-setup.sh';
  END IF;
END $$;

-- 8. Afficher l'état final
SELECT 
  u.id,
  u.email,
  COALESCE(ur.role, 'NON ASSIGNÉ') as role,
  COALESCE(p.username, 'Sans nom') as username,
  u.created_at,
  CASE 
    WHEN ur.role = 'super_admin' THEN '✅ /dashboard/super-admin'
    WHEN ur.role = 'admin' THEN '✅ /dashboard/admin'
    WHEN ur.role = 'agent' THEN '✅ /dashboard/agent'
    WHEN ur.role = 'user' THEN '✅ /dashboard/user'
    ELSE '❌ PAS DE RÔLE - Sera redirigé vers /auth'
  END as dashboard
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@ndjobi.ga'
ORDER BY 
  CASE ur.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'agent' THEN 3
    WHEN 'user' THEN 4
    ELSE 5
  END;
