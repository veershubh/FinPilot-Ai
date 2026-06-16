-- 005_goals.sql – Financial Goals / Strategy module schema
-- =================================================

CREATE TABLE IF NOT EXISTS financial_goals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title                 TEXT NOT NULL,
  category              TEXT NOT NULL CHECK (category IN (
    'retirement','emergency_fund','debt_payoff','investment',
    'savings','education','home','other'
  )),

  -- Financial data
  target_amount         NUMERIC NOT NULL DEFAULT 0,
  current_amount        NUMERIC NOT NULL DEFAULT 0,
  monthly_contribution  NUMERIC DEFAULT 0,
  target_date           DATE,

  -- Priority and status
  priority              TEXT NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('high','medium','low')
  ),
  status                TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active','completed','paused')
  ),

  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_goals" ON financial_goals
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goals_user ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON financial_goals(user_id, status);

-- End of 005_goals.sql
