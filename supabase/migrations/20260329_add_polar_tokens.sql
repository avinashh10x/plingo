-- ============================================================
-- Migration: Add Polar Token Purchase System
-- ============================================================

-- 1. Add purchased_tokens column to user_credits
--    purchased_tokens: tokens bought via Polar (never auto-reset)
--    credits: free monthly tokens (auto-reset to 100 each month)
ALTER TABLE public.user_credits 
  ADD COLUMN IF NOT EXISTS purchased_tokens INTEGER NOT NULL DEFAULT 0;

-- 2. Create token_transactions table for full audit trail
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,            -- Payment amount in cents
    tokens_granted INTEGER NOT NULL,          -- Tokens calculated: cents × 5
    polar_order_id TEXT UNIQUE,               -- Polar order ID (idempotency key)
    polar_checkout_id TEXT,                   -- Polar checkout ID
    customer_email TEXT,                      -- Customer email from Polar
    status TEXT NOT NULL DEFAULT 'completed', -- completed | refunded
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id 
  ON public.token_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_token_transactions_polar_order 
  ON public.token_transactions(polar_order_id);

-- 3. RLS for token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transaction history
CREATE POLICY "Users can view their own token transactions"
    ON public.token_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert (webhook handler)
CREATE POLICY "Service role can insert token transactions"
    ON public.token_transactions
    FOR INSERT
    WITH CHECK (true);

-- Service role can update (for refunds)
CREATE POLICY "Service role can update token transactions"
    ON public.token_transactions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. Enable realtime for token_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_transactions;
