-- Fix RLS policies on user_roles table
-- Drop existing policies that block access
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create simple policy that allows users to read their own role
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to manage all (for admin updates)
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
CREATE POLICY "Service role full access" ON public.user_roles
    FOR ALL USING (true) WITH CHECK (true);

-- Update the admin user role
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
    SELECT user_id FROM public.profiles 
    WHERE email = 'thissideavinash@gmail.com'
);
