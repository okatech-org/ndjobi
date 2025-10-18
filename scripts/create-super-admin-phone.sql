-- Script pour créer le compte super admin avec téléphone +33661002616
-- À exécuter dans Supabase SQL Editor ou via psql

-- 1. Créer le compte avec le téléphone
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
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '33661002616@ndjobi.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '+33661002616',
  now(),
  '{"phone": "+33661002616", "full_name": "Super Admin NDJOBI"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = '33661002616@ndjobi.com'
);

-- 2. Récupérer l'ID du compte
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = '33661002616@ndjobi.com';
  
  IF v_user_id IS NOT NULL THEN
    -- 3. Assigner le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- 4. Créer le profil
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_user_id, '33661002616@ndjobi.com', 'Super Admin NDJOBI')
    ON CONFLICT (id) DO UPDATE 
    SET full_name = 'Super Admin NDJOBI',
        email = '33661002616@ndjobi.com';
    
    RAISE NOTICE 'Compte super admin créé avec succès : %', v_user_id;
  ELSE
    RAISE NOTICE 'Le compte existe déjà';
  END IF;
END $$;

-- 5. Vérification finale
SELECT 
  u.id,
  u.email,
  u.phone,
  ur.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = '33661002616@ndjobi.com';

-- Devrait afficher :
-- id | email | phone | role | full_name
-- uuid | 33661002616@ndjobi.com | +33661002616 | super_admin | Super Admin NDJOBI

