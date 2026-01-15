-- Complete rewrite of user_credits RLS to allow admin updates
-- The issue: SECURITY DEFINER alone doesn't bypass RLS in Supabase
-- Solution: Create explicit policies that check for admin role

-- Drop ALL existing policies on user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role can update credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role can insert credits" ON public.user_credits;
DROP POLICY IF EXISTS "Allow insert via security definer functions" ON public.user_credits;
DROP POLICY IF EXISTS "Allow update via security definer functions" ON public.user_credits;
DROP POLICY IF EXISTS "Allow all inserts" ON public.user_credits;
DROP POLICY IF EXISTS "Allow all updates" ON public.user_credits;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_email TEXT;
  has_admin_role BOOLEAN;
BEGIN
  -- Check if user is the superadmin by email
  current_email := auth.jwt() ->> 'email';
  IF current_email = 'thissideavinash@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has admin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO has_admin_role;
  
  RETURN has_admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy 1: Users can view their own credits
CREATE POLICY "Users can view their own credits"
    ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Admins can view all credits
CREATE POLICY "Admins can view all credits"
    ON public.user_credits
    FOR SELECT
    USING (public.is_admin());

-- Policy 3: Allow inserts for authenticated users (for signup trigger)
CREATE POLICY "Allow inserts for new users"
    ON public.user_credits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Policy 4: Admins can update any user's credits
CREATE POLICY "Admins can update all credits"
    ON public.user_credits
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Recreate the update function (simplified since RLS now handles auth)
DROP FUNCTION IF EXISTS public.update_user_credits(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.update_user_credits(target_user_id UUID, new_amount INTEGER)
RETURNS jsonb AS $$
DECLARE
  result_count INTEGER;
BEGIN
  -- Validate the new amount
  IF new_amount < 0 THEN
    RAISE EXCEPTION 'Invalid credit amount: % (must be non-negative)', new_amount;
  END IF;

  -- Update or Insert credits
  -- RLS will automatically check if the user is admin
  INSERT INTO public.user_credits (user_id, credits, updated_at)
  VALUES (target_user_id, new_amount, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits = EXCLUDED.credits,
    updated_at = now();
  
  -- Get the result count
  GET DIAGNOSTICS result_count = ROW_COUNT;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'target_user_id', target_user_id,
    'new_amount', new_amount,
    'rows_affected', result_count
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error in update_user_credits: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.update_user_credits IS 'Admin-only function to update user credits. Authorization is handled by RLS policies.';
COMMENT ON FUNCTION public.is_admin IS 'Helper function to check if current user is an admin.';
