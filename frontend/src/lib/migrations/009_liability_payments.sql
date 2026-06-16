-- 009_liability_payments.sql – Liability payments & enhancements
-- =================================================

-- 1. Add next_due_date column to liabilities (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'liabilities' AND column_name = 'next_due_date'
  ) THEN
    ALTER TABLE liabilities ADD COLUMN next_due_date DATE;
  END IF;
END $$;

-- 2. Create liability_payments table for EMI & prepayment tracking
CREATE TABLE IF NOT EXISTS liability_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liability_id      UUID NOT NULL REFERENCES liabilities(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  amount            NUMERIC NOT NULL,
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type      TEXT NOT NULL DEFAULT 'emi' CHECK (
    payment_type IN ('emi', 'prepayment', 'closure')
  ),
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE liability_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_liability_payments" ON liability_payments
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_liability_payments_liability ON liability_payments(liability_id);
CREATE INDEX IF NOT EXISTS idx_liability_payments_user ON liability_payments(user_id);

-- End of 009_liability_payments.sql
