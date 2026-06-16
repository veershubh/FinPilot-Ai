-- 008_liabilities.sql – Liabilities module schema
-- =================================================

CREATE TABLE IF NOT EXISTS liabilities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name                TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN (
    'home_loan','auto_loan','education_loan','personal_loan',
    'credit_card','other'
  )),
  institution         TEXT,

  -- Financial data
  outstanding_balance NUMERIC NOT NULL DEFAULT 0,
  original_amount     NUMERIC NOT NULL DEFAULT 0,
  interest_rate       NUMERIC DEFAULT 0,
  monthly_emi         NUMERIC DEFAULT 0,
  
  start_date          DATE,
  end_date            DATE,
  notes               TEXT,

  -- Status
  status              TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active','paid_off')
  ),

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

-- 2. Create liability_history table
CREATE TABLE IF NOT EXISTS liability_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liability_id        UUID NOT NULL REFERENCES liabilities(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  recorded_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  outstanding_balance NUMERIC NOT NULL DEFAULT 0,
  
  created_at          TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent multiple entries per liability per day
  UNIQUE(liability_id, recorded_date)
);

-- Enable RLS for liability_history
ALTER TABLE liability_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_liability_history" ON liability_history
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_liability_history_liability_id ON liability_history(liability_id);
CREATE INDEX IF NOT EXISTS idx_liability_history_user_id ON liability_history(user_id);

-- 3. Create Trigger Function to Auto-Record History
CREATE OR REPLACE FUNCTION record_liability_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the history record for today
  INSERT INTO liability_history (liability_id, user_id, recorded_date, outstanding_balance)
  VALUES (NEW.id, NEW.user_id, CURRENT_DATE, NEW.outstanding_balance)
  ON CONFLICT (liability_id, recorded_date)
  DO UPDATE SET
    outstanding_balance = EXCLUDED.outstanding_balance;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT and UPDATE on outstanding_balance
DROP TRIGGER IF EXISTS trigger_record_liability_history ON liabilities;
CREATE TRIGGER trigger_record_liability_history
AFTER INSERT OR UPDATE OF outstanding_balance ON liabilities
FOR EACH ROW
EXECUTE FUNCTION record_liability_history();

-- End of 008_liabilities.sql
