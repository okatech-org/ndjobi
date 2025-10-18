-- Migration: create or update Super Admin profile and role safely (fixed)
-- Purpose: Ensure the Super Admin profile and role exist so login can proceed
-- Notes: Temporarily disable RLS on public tables only.

-- 1) Disable RLS temporarily on public tables used
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2) Create or update the Super Admin profile based on existing user in auth.users
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  organization,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.email,
  'Super Administrateur',
  COALESCE(u.phone, '+33661002616'),
  'Administration Système',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  organization = EXCLUDED.organization,
  updated_at = NOW();

-- 3) Ensure the Super Admin role is present
-- Note: user_roles has unique constraint on (user_id, role)
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at
)
SELECT
  u.id,
  'super_admin'::app_role,
  NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (user_id, role) DO UPDATE SET created_at = EXCLUDED.created_at;

-- 4) Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;