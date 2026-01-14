-- Auto-approve new users instead of waitlist
-- Change default status from 'pending' to 'approved'

-- Update the default status for new profiles
ALTER TABLE public.profiles 
ALTER COLUMN status SET DEFAULT 'approved';

-- Update the handle_new_user function to explicitly set approved status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, avatar_url, status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'approved',
    now()
  );
  
  -- Also create default limits immediately since user is auto-approved
  INSERT INTO public.user_limits (user_id, platform, monthly_limit)
  VALUES 
    (NEW.id, 'twitter', 30),
    (NEW.id, 'linkedin', 30),
    (NEW.id, 'instagram', 30),
    (NEW.id, 'facebook', 30),
    (NEW.id, 'threads', 30)
  ON CONFLICT (user_id, platform) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update any existing pending users to approved (optional - run this if you want to approve existing users)
-- UPDATE public.profiles SET status = 'approved', approved_at = now() WHERE status = 'pending';
