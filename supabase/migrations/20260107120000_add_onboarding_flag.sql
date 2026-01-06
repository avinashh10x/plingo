-- Add persistent onboarding flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_onboarding boolean DEFAULT false;

-- Add RLS policy for updating this specific column (optional, but good practice if separating permissions)
-- Existing "Users update own profile" covers it, but we ensure defaults are set.
