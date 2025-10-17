-- Script de création des comptes démo pour NDJOBI
-- À exécuter via Supabase Studio ou CLI

-- ============================================
-- 1. COMPTE AGENT DGSS (agent)
-- ============================================

-- Créer l'utilisateur agent DGSS (si pas déjà existant)
DO $$
DECLARE
  agent_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe
  SELECT id INTO agent_user_id FROM auth.users WHERE email = '24177777002@ndjobi.com';
  
  IF agent_user_id IS NULL THEN
    -- Créer l'utilisateur via auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      '24177777002@ndjobi.com',
      crypt('123456', gen_salt('bf')), -- Mot de passe: 123456
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Agent DGSS Démo","phone":"+24177777002"}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO agent_user_id;

    -- Créer le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
      agent_user_id,
      '24177777002@ndjobi.com',
      'Agent DGSS Démo',
      '+24177777002',
      NOW(),
      NOW()
    );

    -- Assigner le rôle
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (agent_user_id, 'agent', NOW())
    ON CONFLICT (user_id) DO UPDATE SET role = 'agent';

    RAISE NOTICE 'Compte Agent DGSS créé avec succès: %', agent_user_id;
  ELSE
    -- Mettre à jour le rôle si l'utilisateur existe déjà
    UPDATE public.user_roles SET role = 'agent' WHERE user_id = agent_user_id;
    RAISE NOTICE 'Compte Agent DGSS existe déjà: %', agent_user_id;
  END IF;
END $$;

-- ============================================
-- 2. COMPTE PROTOCOLE D'ÉTAT (admin)
-- ============================================

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe
  SELECT id INTO admin_user_id FROM auth.users WHERE email = '24177777003@ndjobi.com';
  
  IF admin_user_id IS NULL THEN
    -- Créer l'utilisateur
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      '24177777003@ndjobi.com',
      crypt('123456', gen_salt('bf')), -- Mot de passe: 123456
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Protocole d\'État - Président","phone":"+24177777003"}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO admin_user_id;

    -- Créer le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
      admin_user_id,
      '24177777003@ndjobi.com',
      'Protocole d\'État - Président',
      '+24177777003',
      NOW(),
      NOW()
    );

    -- Assigner le rôle admin
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (admin_user_id, 'admin', NOW())
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

    RAISE NOTICE 'Compte Protocole d\'État créé avec succès: %', admin_user_id;
  ELSE
    -- Mettre à jour le rôle si l'utilisateur existe déjà
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = admin_user_id;
    RAISE NOTICE 'Compte Protocole d\'État existe déjà: %', admin_user_id;
  END IF;
END $$;

-- ============================================
-- 3. COMPTE CITOYEN (user) - Pour compléter
-- ============================================

DO $$
DECLARE
  user_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe
  SELECT id INTO user_user_id FROM auth.users WHERE email = '24177777001@ndjobi.com';
  
  IF user_user_id IS NULL THEN
    -- Créer l'utilisateur
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      '24177777001@ndjobi.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Citoyen Démo","phone":"+24177777001"}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO user_user_id;

    -- Créer le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
      user_user_id,
      '24177777001@ndjobi.com',
      'Citoyen Démo',
      '+24177777001',
      NOW(),
      NOW()
    );

    -- Assigner le rôle user
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (user_user_id, 'user', NOW())
    ON CONFLICT (user_id) DO UPDATE SET role = 'user';

    RAISE NOTICE 'Compte Citoyen créé avec succès: %', user_user_id;
  ELSE
    UPDATE public.user_roles SET role = 'user' WHERE user_id = user_user_id;
    RAISE NOTICE 'Compte Citoyen existe déjà: %', user_user_id;
  END IF;
END $$;

-- ============================================
-- 4. VÉRIFICATION FINALE
-- ============================================

-- Afficher tous les comptes démo créés
SELECT 
  u.id,
  u.email,
  ur.role,
  p.full_name,
  p.phone,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '24177777%@ndjobi.com'
ORDER BY ur.role;

-- ============================================
-- 5. DONNÉES DE TEST (Optionnel)
-- ============================================

-- Créer quelques signalements de test pour l'agent DGSS
DO $$
DECLARE
  agent_id uuid;
  citoyen_id uuid;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO agent_id FROM auth.users WHERE email = '24177777002@ndjobi.com';
  SELECT id INTO citoyen_id FROM auth.users WHERE email = '24177777001@ndjobi.com';
  
  IF agent_id IS NOT NULL AND citoyen_id IS NOT NULL THEN
    -- Créer un signalement de test
    INSERT INTO public.signalements (
      title,
      description,
      category,
      urgency,
      location,
      author_id,
      status,
      is_anonymous,
      created_at
    ) VALUES (
      'Signalement de test - Corruption administrative',
      'Ceci est un signalement de démonstration pour tester le système NDJOBI.',
      'corruption',
      'high',
      'Libreville, Gabon',
      citoyen_id,
      'pending',
      false,
      NOW()
    );
    
    RAISE NOTICE 'Signalement de test créé';
  END IF;
END $$;

