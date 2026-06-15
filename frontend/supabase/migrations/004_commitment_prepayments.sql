-- 004_commitment_prepayments.sql
-- Prepayment / principal reduction tracking table
-- Run this SQL in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.commitment_prepayments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  commitment_id uuid REFERENCES public.commitments ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  interest_saved numeric NOT NULL DEFAULT 0,
  months_reduced integer NOT NULL DEFAULT 0,
  new_outstanding numeric NOT NULL DEFAULT 0,
  new_tenure_months integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.commitment_prepayments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_prepayments' AND policyname = 'Users can view own prepayments') THEN
    CREATE POLICY "Users can view own prepayments" ON public.commitment_prepayments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitment_prepayments' AND policyname = 'Users can insert own prepayments') THEN
    CREATE POLICY "Users can insert own prepayments" ON public.commitment_prepayments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_commitment_prepayments_commitment_id ON public.commitment_prepayments(commitment_id);
CREATE INDEX IF NOT EXISTS idx_commitment_prepayments_user_id ON public.commitment_prepayments(user_id);

-- Reload PostgREST schema cache so the new table is immediately available
NOTIFY pgrst, 'reload schema';
