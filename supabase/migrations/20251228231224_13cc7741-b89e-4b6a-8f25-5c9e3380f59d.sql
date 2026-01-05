-- Add admin and waitlist functionality to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Create user_limits table for post limits per platform per month
CREATE TABLE IF NOT EXISTS public.user_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  monthly_limit integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS on user_limits
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can manage limits, users can read their own
CREATE POLICY "Users can view their own limits"
ON public.user_limits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all limits"
ON public.user_limits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add trigger for updated_at on user_limits
CREATE TRIGGER update_user_limits_updated_at
BEFORE UPDATE ON public.user_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default limits when a user is approved
CREATE OR REPLACE FUNCTION public.create_default_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO public.user_limits (user_id, platform, monthly_limit)
    VALUES 
      (NEW.user_id, 'twitter', 30),
      (NEW.user_id, 'linkedin', 30),
      (NEW.user_id, 'instagram', 30),
      (NEW.user_id, 'facebook', 30),
      (NEW.user_id, 'threads', 30)
    ON CONFLICT (user_id, platform) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_approved
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_limits();