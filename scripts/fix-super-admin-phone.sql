-- Script pour lier le téléphone +33661002616 au compte super admin iasted@me.com
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier le compte super admin existant
SELECT id, email FROM auth.users WHERE email = 'iasted@me.com';

-- 2. Mettre à jour le phone du compte super admin
UPDATE auth.users 
SET phone = '+33661002616',
    raw_user_meta_data = raw_user_meta_data || jsonb_build_object('phone', '+33661002616')
WHERE email = 'iasted@me.com';

-- 3. Créer un compte avec l'email téléphone SI il n'existe pas
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
  updated_at
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
  jsonb_build_object('phone', '+33661002616', 'full_name', 'Super Admin'),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = '33661002616@ndjobi.com'
);

-- 4. Récupérer l'ID du compte téléphone créé
DO $$
DECLARE
  phone_user_id uuid;
BEGIN
  SELECT id INTO phone_user_id FROM auth.users WHERE email = '33661002616@ndjobi.com';
  
  IF phone_user_id IS NOT NULL THEN
    -- 5. Assigner le rôle super_admin au compte téléphone
    INSERT INTO public.user_roles (user_id, role)
    VALUES (phone_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- 6. Créer le profil
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (phone_user_id, '33661002616@ndjobi.com', 'Super Admin')
    ON CONFLICT (id) DO UPDATE 
    SET full_name = 'Super Admin';
  END IF;
END $$;

-- Vérification finale
SELECT 
  u.id,
  u.email,
  u.phone,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com' OR u.email = 'iasted@me.com';

