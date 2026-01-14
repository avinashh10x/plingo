-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 100,
    last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id)
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own credits
CREATE POLICY "Users can view their own credits"
    ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can update credits (critical for security)
CREATE POLICY "Service role can update credits"
    ON public.user_credits
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Only service role can insert credits (usually handled on signup trigger, but robust enough)
CREATE POLICY "Service role can insert credits"
    ON public.user_credits
    FOR INSERT
    WITH CHECK (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, credits, last_reset_date)
    VALUES (new.id, 100, CURRENT_DATE);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_credits();

-- Backfill existing users who don't have credits
INSERT INTO public.user_credits (user_id, credits, last_reset_date)
SELECT id, 100, CURRENT_DATE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;
