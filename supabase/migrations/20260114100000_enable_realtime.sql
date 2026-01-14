-- Enable Realtime for user_credits and notifications tables

-- Ensure the publication exists (usually created by default in Supabase, but good to be safe)
-- Note: 'supabase_realtime' is the default publication name for Supabase Realtime.

-- Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_credits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Verify RLS policies allow reading (already done in previous migrations, but Realtime respects RLS)
-- user_credits has "Users can view their own credits"
-- notifications usually has similar policies. If not, Realtime might not emit to clients.
