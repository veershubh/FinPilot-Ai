-- 003_commitments_schema.sql
-- Commitments tables: commitments, commitment_payments, commitment_ai_insights, commitment_notifications
-- Run this SQL in Supabase Dashboard → SQL Editor
--
-- IMPORTANT: Uses CREATE TABLE IF NOT EXISTS so it is safe to re-run.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. COMMITMENTS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.commitments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  provider text,
  description text,
  original_amount numeric NOT NULL DEFAULT 0,
  monthly_amount numeric NOT NULL DEFAULT 0,
  interest_rate numeric DEFAULT 0,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  outstanding_balance numeric DEFAULT 0,
  progress_percentage numeric DEFAULT 0,
  months_completed integer DEFAULT 0,
  months_remaining integer DEFAULT 0,
  next_due_date date,
  auto_debit boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'Users can view own commitments') THEN
    CREATE POLICY "Users can view own commitments" ON public.commitments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'Users can insert own commitments') THEN
    CREATE POLICY "Users can insert own commitments" ON public.commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'Users can update own commitments') THEN
    CREATE POLICY "Users can update own commitments" ON public.commitments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'Users can delete own commitments') THEN
    CREATE POLICY "Users can delete own commitments" ON public.commitments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. COMMITMENT PAYMENTS
-- Matches TypeScript: CommitmentPayment { paid_date, payment_mode }
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.commitment_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  commitment_id uuid REFERENCES public.commitments ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  paid_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.commitment_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_payments' AND policyname = 'Users can view own commitment payments') THEN
    CREATE POLICY "Users can view own commitment payments" ON public.commitment_payments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_payments' AND policyname = 'Users can insert own commitment payments') THEN
    CREATE POLICY "Users can insert own commitment payments" ON public.commitment_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_payments' AND policyname = 'Users can update own commitment payments') THEN
    CREATE POLICY "Users can update own commitment payments" ON public.commitment_payments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_payments' AND policyname = 'Users can delete own commitment payments') THEN
    CREATE POLICY "Users can delete own commitment payments" ON public.commitment_payments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. COMMITMENT AI INSIGHTS
-- Matches TypeScript: CommitmentAIInsight { generated_at }
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.commitment_ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  commitment_id uuid REFERENCES public.commitments ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  affordability_score numeric DEFAULT 0,
  risk_score numeric DEFAULT 0,
  financial_impact_score numeric DEFAULT 0,
  health_score_impact numeric DEFAULT 0,
  projected_health_score numeric DEFAULT 0,
  recommendation text,
  generated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.commitment_ai_insights ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_ai_insights' AND policyname = 'Users can view own commitment AI insights') THEN
    CREATE POLICY "Users can view own commitment AI insights" ON public.commitment_ai_insights FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_ai_insights' AND policyname = 'Users can insert own commitment AI insights') THEN
    CREATE POLICY "Users can insert own commitment AI insights" ON public.commitment_ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_ai_insights' AND policyname = 'Users can update own commitment AI insights') THEN
    CREATE POLICY "Users can update own commitment AI insights" ON public.commitment_ai_insights FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_ai_insights' AND policyname = 'Users can delete own commitment AI insights') THEN
    CREATE POLICY "Users can delete own commitment AI insights" ON public.commitment_ai_insights FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. COMMITMENT NOTIFICATIONS
-- Matches TypeScript: CommitmentNotification { type, message (NOT NULL) }
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.commitment_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  commitment_id uuid REFERENCES public.commitments ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'due_soon',
  message text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.commitment_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_notifications' AND policyname = 'Users can view own commitment notifications') THEN
    CREATE POLICY "Users can view own commitment notifications" ON public.commitment_notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_notifications' AND policyname = 'Users can insert own commitment notifications') THEN
    CREATE POLICY "Users can insert own commitment notifications" ON public.commitment_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_notifications' AND policyname = 'Users can update own commitment notifications') THEN
    CREATE POLICY "Users can update own commitment notifications" ON public.commitment_notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_notifications' AND policyname = 'Users can delete own commitment notifications') THEN
    CREATE POLICY "Users can delete own commitment notifications" ON public.commitment_notifications FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON public.commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitments_status ON public.commitments(status);
CREATE INDEX IF NOT EXISTS idx_commitments_next_due ON public.commitments(next_due_date);
CREATE INDEX IF NOT EXISTS idx_commitment_payments_commitment_id ON public.commitment_payments(commitment_id);
CREATE INDEX IF NOT EXISTS idx_commitment_payments_user_id ON public.commitment_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitment_ai_insights_commitment_id ON public.commitment_ai_insights(commitment_id);
CREATE INDEX IF NOT EXISTS idx_commitment_notifications_user_id ON public.commitment_notifications(user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. REALTIME (safe to re-run — will no-op if already added)
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.commitments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.commitment_payments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- End of migration
-- ══════════════════════════════════════════════════════════════════════════════
