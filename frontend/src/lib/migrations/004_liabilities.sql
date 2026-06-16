-- 004_liabilities.sql – Liabilities module schema
-- =================================================

CREATE TABLE IF NOT EXISTS liabilities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name                TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN (
    'home_loan','vehicle_loan','personal_loan','education_loan',
    'credit_card','business_loan','other'
  )),
  lender              TEXT,

  -- Financial data
  original_amount     NUMERIC NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC NOT NULL DEFAULT 0,
  monthly_emi         NUMERIC NOT NULL DEFAULT 0,
  interest_rate       NUMERIC DEFAULT 0,
  start_date          DATE NOT NULL,
  end_date            DATE,
  next_due_date       DATE,

  -- Status
  status              TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active','closed','defaulted')
  ),

  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_liabilities" ON liabilities
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_category ON liabilities(user_id, category);
CREATE INDEX IF NOT EXISTS idx_liabilities_status ON liabilities(user_id, status);

-- End of 004_liabilities.sql
