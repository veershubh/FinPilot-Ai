-- 006_liabilities_schema.sql
-- Creates `liabilities`, `liability_history`, and `liability_payments` tables.
-- Column names match the TypeScript interfaces in src/types/liabilities.ts
-- and the Supabase queries in src/app/api/liabilities/route.ts.
-- Run this SQL in Supabase Dashboard → SQL Editor.

-- ==============================
-- liabilities table
-- ==============================
CREATE TABLE IF NOT EXISTS public.liabilities (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name                text        NOT NULL,
  category            text        NOT NULL DEFAULT 'other',
  institution         text,
  outstanding_balance numeric     NOT NULL DEFAULT 0,
  original_amount     numeric     NOT NULL DEFAULT 0,
  interest_rate       numeric     NOT NULL DEFAULT 0,
  monthly_emi         numeric     NOT NULL DEFAULT 0,
  start_date          date,
  end_date            date,
  next_due_date       date,
  notes               text,
  status              text        NOT NULL DEFAULT 'active',
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- liability_history table
-- (used by /liabilities/[id] detail page for paydown chart)
-- ==============================
CREATE TABLE IF NOT EXISTS public.liability_history (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  liability_id        uuid        REFERENCES public.liabilities ON DELETE CASCADE NOT NULL,
  user_id             uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recorded_date       date        NOT NULL DEFAULT CURRENT_DATE,
  outstanding_balance numeric     NOT NULL DEFAULT 0,
  created_at          timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- liability_payments table
-- (used by /liabilities/[id] detail page for payment history)
-- ==============================
CREATE TABLE IF NOT EXISTS public.liability_payments (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  liability_id        uuid        REFERENCES public.liabilities ON DELETE CASCADE NOT NULL,
  user_id             uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount              numeric     NOT NULL,
  payment_date        date        NOT NULL DEFAULT CURRENT_DATE,
  payment_type        text        NOT NULL DEFAULT 'emi',
  notes               text,
  created_at          timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- Indexes
-- ==============================
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id       ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_category      ON public.liabilities(category);
CREATE INDEX IF NOT EXISTS idx_liabilities_status        ON public.liabilities(status);
CREATE INDEX IF NOT EXISTS idx_liabilities_next_due_date ON public.liabilities(next_due_date);
CREATE INDEX IF NOT EXISTS idx_liabilities_created_at    ON public.liabilities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_liability_history_liability_id   ON public.liability_history(liability_id);
CREATE INDEX IF NOT EXISTS idx_liability_history_user_id        ON public.liability_history(user_id);
CREATE INDEX IF NOT EXISTS idx_liability_history_recorded_date  ON public.liability_history(recorded_date);

CREATE INDEX IF NOT EXISTS idx_liability_payments_liability_id  ON public.liability_payments(liability_id);
CREATE INDEX IF NOT EXISTS idx_liability_payments_user_id       ON public.liability_payments(user_id);

-- ==============================
-- Auto-update updated_at trigger
-- (reuses the set_updated_at() function created in 005_assets_schema.sql)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_liabilities_updated_at'
  ) THEN
    CREATE TRIGGER trigger_liabilities_updated_at
      BEFORE UPDATE ON public.liabilities
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ==============================
-- Row Level Security
-- ==============================
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liabilities' AND policyname = 'Users can view own liabilities') THEN
    CREATE POLICY "Users can view own liabilities"   ON public.liabilities FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liabilities' AND policyname = 'Users can insert own liabilities') THEN
    CREATE POLICY "Users can insert own liabilities" ON public.liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liabilities' AND policyname = 'Users can update own liabilities') THEN
    CREATE POLICY "Users can update own liabilities" ON public.liabilities FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liabilities' AND policyname = 'Users can delete own liabilities') THEN
    CREATE POLICY "Users can delete own liabilities" ON public.liabilities FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.liability_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liability_history' AND policyname = 'Users can view own liability history') THEN
    CREATE POLICY "Users can view own liability history"   ON public.liability_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liability_history' AND policyname = 'Users can insert own liability history') THEN
    CREATE POLICY "Users can insert own liability history" ON public.liability_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.liability_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liability_payments' AND policyname = 'Users can view own liability payments') THEN
    CREATE POLICY "Users can view own liability payments"   ON public.liability_payments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liability_payments' AND policyname = 'Users can insert own liability payments') THEN
    CREATE POLICY "Users can insert own liability payments" ON public.liability_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================
-- Realtime
-- ==============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.liabilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.liability_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.liability_payments;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
