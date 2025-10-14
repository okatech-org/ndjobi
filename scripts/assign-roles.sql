-- ============================================
-- Assigner les rôles aux comptes démo NDJOBI
-- ============================================
-- À exécuter dans Supabase Studio SQL Editor
-- http://127.0.0.1:54323/project/default/editor

-- Assigner les rôles aux comptes démo
DO $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Super Admin (77777000)
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777000@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
    v_count := v_count + 1;
    RAISE NOTICE '✅ Super Admin configuré';
  END IF;

  -- Admin (77777003)
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777003@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    v_count := v_count + 1;
    RAISE NOTICE '✅ Admin configuré';
  END IF;

  -- Agent DGSS (77777002)
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777002@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'agent')
    ON CONFLICT (user_id) DO UPDATE SET role = 'agent';
    v_count := v_count + 1;
    RAISE NOTICE '✅ Agent DGSS configuré';
  END IF;

  -- Citoyen (77777001)
  SELECT id INTO v_user_id FROM auth.users WHERE email = '24177777001@ndjobi.ga';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'user')
    ON CONFLICT (user_id) DO UPDATE SET role = 'user';
    v_count := v_count + 1;
    RAISE NOTICE '✅ Citoyen configuré';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total : % rôles configurés', v_count;
  RAISE NOTICE '====================================';
END $$;

-- Afficher les comptes configurés
SELECT 
  CASE 
    WHEN ur.role = 'super_admin' THEN '⚡ Super Admin'
    WHEN ur.role = 'admin' THEN '👑 Admin'
    WHEN ur.role = 'agent' THEN '👥 Agent DGSS'
    WHEN ur.role = 'user' THEN '👤 Citoyen'
    ELSE ur.role
  END as "Rôle",
  REPLACE(REPLACE(u.email, '@ndjobi.ga', ''), '241', '+241 ') as "Numéro",
  '123456' as "PIN",
  u.created_at::date as "Créé le"
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '%@ndjobi.ga'
ORDER BY 
  CASE ur.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'agent' THEN 3
    WHEN 'user' THEN 4
    ELSE 5
  END;
