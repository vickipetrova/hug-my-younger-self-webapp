-- Create credit_transactions table to track all credit changes
-- This serves as an audit log for the credit system and Stripe integration
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Credit amount (positive = added, negative = used)
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'adjustment')),
  
  -- Link to generation (for 'usage' type transactions)
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  
  -- Stripe payment details (for 'purchase' and 'refund' types)
  stripe_payment_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_amount_cents INTEGER,        -- Actual amount paid in cents (999 = $9.99)
  stripe_currency TEXT,               -- Currency code (usd, eur, gbp, etc.)
  
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert transactions (via service role or server-side)
-- Users shouldn't directly insert transactions - this is handled by server functions
CREATE POLICY "Service role can insert transactions"
  ON public.credit_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can insert transactions (for manual adjustments/bonuses)
CREATE POLICY "Admins can insert any transaction"
  ON public.credit_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for faster queries
CREATE INDEX credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX credit_transactions_type_idx ON public.credit_transactions(type);
CREATE INDEX credit_transactions_created_at_idx ON public.credit_transactions(created_at DESC);
CREATE INDEX credit_transactions_stripe_payment_id_idx ON public.credit_transactions(stripe_payment_id) 
  WHERE stripe_payment_id IS NOT NULL;

