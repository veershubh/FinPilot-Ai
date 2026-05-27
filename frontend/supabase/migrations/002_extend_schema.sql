-- 002_extend_schema.sql
-- Extend existing schema to match the required FinPilot AI data model
-- This migration assumes the initial schema from 001_initial_schema.sql is present.

-- ==============================
-- Alter existing tables
-- ==============================

-- transactions: rename columns, add title and notes
ALTER TABLE public.transactions RENAME COLUMN transaction_type TO type;
ALTER TABLE public.transactions RENAME COLUMN description TO notes;
ALTER TABLE public.transactions ADD COLUMN title text;

-- budgets: rename spending_limit to monthly_limit, add spent_amount
ALTER TABLE public.budgets RENAME COLUMN spending_limit TO monthly_limit;
ALTER TABLE public.budgets ADD COLUMN spent_amount numeric DEFAULT 0 NOT NULL;

-- goals: rename deadline to target_date, add status column
ALTER TABLE public.goals RENAME COLUMN deadline TO target_date;
ALTER TABLE public.goals ADD COLUMN status text NOT NULL DEFAULT 'active';

-- profiles: add monthly_income and onboarding_completed if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='monthly_income') THEN
    ALTER TABLE public.profiles ADD COLUMN monthly_income numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='onboarding_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- ==============================
-- New tables
-- ==============================

-- subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  renewal_date date NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score numeric NOT NULL,
  severity text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==============================
-- Row Level Security (RLS) for new tables
-- ==============================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own AI insights"
  ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI insights"
  ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI insights"
  ON public.ai_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI insights"
  ON public.ai_insights FOR DELETE USING (auth.uid() = user_id);

-- ==============================
-- Realtime publication for new tables (if using Supabase Realtime)
-- ==============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;

-- ==============================
-- End of migration
-- ==============================
