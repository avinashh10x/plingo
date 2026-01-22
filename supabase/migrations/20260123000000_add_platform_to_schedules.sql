-- Add platform column to post_schedules table
-- This allows tracking which platform each schedule belongs to when posting to multiple platforms

ALTER TABLE public.post_schedules 
ADD COLUMN platform public.platform_type;

-- Create index for better query performance
CREATE INDEX idx_post_schedules_platform ON public.post_schedules(platform);

-- Backfill existing records (if any) with a default value
-- Since we can't determine the platform for old records, we'll leave them NULL
-- The edge function will handle NULL platforms gracefully
