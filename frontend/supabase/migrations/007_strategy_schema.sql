-- 007_strategy_schema.sql
-- Creates the `financial_goals` table for the Strategy module.
-- Column names match the TypeScript FinancialGoal interface in src/types/strategy.ts
-- and the Supabase queries in src/app/api/strategy/route.ts.
-- Run this SQL in Supabase Dashboard → SQL Editor.

-- ==============================
-- financial_goals table
-- ==============================
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title                 text        NOT NULL,
  category              text        NOT NULL DEFAULT 'other',
  target_amount         numeric     NOT NULL DEFAULT 0,
  current_amount        numeric     NOT NULL DEFAULT 0,
  monthly_contribution  numeric     NOT NULL DEFAULT 0,
  target_date           date,
  priority              text        NOT NULL DEFAULT 'medium',
  status                text        NOT NULL DEFAULT 'active',
  notes                 text,
  created_at            timestamptz DEFAULT now() NOT NULL,
  updated_at            timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- Indexes
-- ==============================
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id    ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status     ON public.financial_goals(status);
CREATE INDEX IF NOT EXISTS idx_financial_goals_category   ON public.financial_goals(category);
CREATE INDEX IF NOT EXISTS idx_financial_goals_priority   ON public.financial_goals(priority);
CREATE INDEX IF NOT EXISTS idx_financial_goals_created_at ON public.financial_goals(created_at DESC);

-- ==============================
-- Auto-update updated_at trigger
-- (reuses the set_updated_at() function created in 005_assets_schema.sql)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_financial_goals_updated_at'
  ) THEN
    CREATE TRIGGER trigger_financial_goals_updated_at
      BEFORE UPDATE ON public.financial_goals
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ==============================
-- Row Level Security
-- ==============================
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_goals' AND policyname = 'Users can view own goals') THEN
    CREATE POLICY "Users can view own goals"   ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_goals' AND policyname = 'Users can insert own goals') THEN
    CREATE POLICY "Users can insert own goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_goals' AND policyname = 'Users can update own goals') THEN
    CREATE POLICY "Users can update own goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_goals' AND policyname = 'Users can delete own goals') THEN
    CREATE POLICY "Users can delete own goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================
-- Realtime
-- ==============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_goals;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
