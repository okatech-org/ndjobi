-- Create SECURITY DEFINER function to fetch the Super Admin profile without exposing tables
CREATE OR REPLACE FUNCTION public.get_super_admin_profile()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  organization text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.full_name, p.phone, COALESCE(p.organization, 'Administration Système')
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'super_admin'::app_role
    AND p.email = '33661002616@ndjobi.com'
  LIMIT 1;
$$;

-- Grant execute to anon and authenticated roles to allow RPC from client
GRANT EXECUTE ON FUNCTION public.get_super_admin_profile() TO anon, authenticated;