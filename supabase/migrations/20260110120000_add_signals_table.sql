-- ==========================================
-- Signals Table for AI Content Agent
-- Stores external signals (HN, GitHub, etc.) for RAG-style content generation
-- ==========================================

-- Create signals table
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL DEFAULT 'tech',      -- 'tech', 'lifestyle', 'business', 'finance', 'health'
  source TEXT NOT NULL,                      -- 'hn', 'github', 'reddit', 'custom'
  title TEXT NOT NULL,
  summary TEXT NOT NULL,                     -- Max 2 lines summary
  url TEXT,
  score INTEGER DEFAULT 0,                   -- Stars/upvotes/points for ranking
  metadata JSONB DEFAULT '{}',               -- Additional data (language, author, etc.)
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.signals IS 'External signals for AI content generation (HN, GitHub, etc.)';

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_signals_domain ON public.signals(domain);
CREATE INDEX IF NOT EXISTS idx_signals_source ON public.signals(source);
CREATE INDEX IF NOT EXISTS idx_signals_expires ON public.signals(expires_at);
CREATE INDEX IF NOT EXISTS idx_signals_score ON public.signals(score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_domain_source ON public.signals(domain, source);

-- Enable RLS
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Public read access (signals are public content)
CREATE POLICY "Signals are publicly readable"
  ON public.signals
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update/delete (via Edge Functions)
CREATE POLICY "Service role can manage signals"
  ON public.signals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- Cleanup function to keep only latest signals per domain/source
-- ==========================================

CREATE OR REPLACE FUNCTION cleanup_old_signals()
RETURNS void AS $$
BEGIN
  -- Delete signals older than their expiry time
  DELETE FROM public.signals WHERE expires_at < NOW();
  
  -- Keep only top 20 per domain/source combo
  DELETE FROM public.signals s1
  WHERE s1.id NOT IN (
    SELECT s2.id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY domain, source ORDER BY score DESC, fetched_at DESC) as rn
      FROM public.signals
    ) s2
    WHERE s2.rn <= 20
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (optional - can also be triggered via cron)
COMMENT ON FUNCTION cleanup_old_signals() IS 'Removes expired signals and keeps only top 20 per domain/source';
