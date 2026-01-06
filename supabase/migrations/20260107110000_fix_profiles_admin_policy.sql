-- Fix profiles update for admin
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Fix user_limits RLS for admin
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert user_limits" ON public.user_limits;
CREATE POLICY "Admins can insert user_limits" ON public.user_limits
  FOR INSERT
  WITH CHECK (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update user_limits" ON public.user_limits;
CREATE POLICY "Admins can update user_limits" ON public.user_limits
  FOR UPDATE
  USING (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete user_limits" ON public.user_limits;
CREATE POLICY "Admins can delete user_limits" ON public.user_limits
  FOR DELETE
  USING (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can read user_limits" ON public.user_limits;
CREATE POLICY "Admins can read user_limits" ON public.user_limits
  FOR SELECT
  USING (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );
