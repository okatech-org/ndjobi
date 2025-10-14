-- ============================================
-- Script SQL pour créer/réparer un Super Admin
-- ============================================

-- Option 1: Promouvoir le premier utilisateur trouvé en Super Admin
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Récupérer le premier utilisateur
  SELECT id, email INTO v_user_id, v_email
  FROM auth.users
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Supprimer tous les rôles existants
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Assigner super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    
    -- Mettre à jour le profil
    UPDATE public.profiles 
    SET username = 'Super Admin'
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ SUCCESS: User % is now SUPER ADMIN', v_email;
    RAISE NOTICE 'You can now login with this email and your password';
  ELSE
    RAISE NOTICE '❌ No users found. Please create an account first at /auth';
  END IF;
END $$;

-- Afficher tous les super admins
SELECT 
  u.email,
  p.username,
  ur.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'super_admin'
ORDER BY u.created_at DESC;
