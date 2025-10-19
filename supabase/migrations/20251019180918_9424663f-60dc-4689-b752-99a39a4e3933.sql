-- Migration du compte Agent Pêche
-- Email: 24177888010@ndjobi.com
-- Téléphone: +24177888010
-- PIN: 000000
-- Rôle: agent

DO $$
DECLARE
  v_user_id uuid;
  v_email text := '24177888010@ndjobi.com';
  v_phone text := '+24177888010';
  v_full_name text := 'Agent Pêche';
  v_organization text := 'Ministère de la Mer de la Pêche et de l''Économie Bleue';
  v_pin_hash text := '$2a$10$YourHashedPINHere'; -- Hash du PIN 000000
BEGIN
  -- 1. Créer l'utilisateur dans auth.users s'il n'existe pas
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    aud,
    role
  )
  SELECT
    gen_random_uuid(),
    v_email,
    crypt('000000', gen_salt('bf')),
    now(),
    v_phone,
    now(),
    jsonb_build_object(
      'full_name', v_full_name,
      'phone', v_phone,
      'role', 'agent'
    ),
    now(),
    now(),
    '',
    'authenticated',
    'authenticated'
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = v_email
  )
  RETURNING id INTO v_user_id;

  -- Si l'utilisateur existe déjà, récupérer son ID
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    -- Mettre à jour les métadonnées existantes
    UPDATE auth.users
    SET 
      phone = v_phone,
      phone_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object(
        'full_name', v_full_name,
        'phone', v_phone,
        'role', 'agent'
      ),
      updated_at = now()
    WHERE email = v_email;
  END IF;

  -- 2. Créer/mettre à jour le profil
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    organization,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_email,
    v_full_name,
    v_phone,
    v_organization,
    jsonb_build_object(
      'role_type', 'agent',
      'ministry', 'Ministère de la Mer',
      'department', 'Pêche et Économie Bleue'
    ),
    now(),
    now()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    organization = EXCLUDED.organization,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  -- 3. Attribuer le rôle agent
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'agent'::app_role, now())
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 4. Créer le hash du PIN
  INSERT INTO public.user_pins (user_id, pin_hash, created_at, updated_at)
  VALUES (
    v_user_id,
    crypt('000000', gen_salt('bf')),
    now(),
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    pin_hash = crypt('000000', gen_salt('bf')),
    updated_at = now();

  RAISE NOTICE '✅ Compte Agent Pêche migré avec succès - ID: %', v_user_id;
END $$;