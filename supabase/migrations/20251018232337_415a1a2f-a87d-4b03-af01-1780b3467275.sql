-- Fix recursion by adjusting profiles RLS policies safely
-- 1) Drop only problematic policies if they exist
DROP POLICY IF EXISTS "President can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "President can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Sub-admins can view sector profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view relevant profiles" ON public.profiles;

-- 2) Create helper function that does NOT reference profiles
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

GRANT EXECUTE ON FUNCTION public.is_president(uuid) TO authenticated, anon;

-- 3) Recreate president policies using the helper function (no recursion)
CREATE POLICY "President can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_president(auth.uid()));

CREATE POLICY "President can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_president(auth.uid()));

-- Note: We intentionally do NOT recreate sub-admin/agent cross-profile policies to avoid recursion.
-- Super admin and self policies remain unchanged.