-- 002_commitments.sql – Commitments module schema
-- =================================================
-- Core table: commitments – represents any recurring financial obligation
CREATE TABLE IF NOT EXISTS commitments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title               TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN (
    'phone_emi','laptop_emi','vehicle_loan','home_loan',
    'credit_card_emi','insurance','sip','subscription',
    'education_loan','personal_loan','family_expense',
    'business_expense','other'
  )),
  provider            TEXT,
  description         TEXT,

  -- Financial data
  original_amount     NUMERIC NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC NOT NULL DEFAULT 0,
  monthly_amount      NUMERIC NOT NULL,
  interest_rate       NUMERIC DEFAULT 0,
  start_date          DATE NOT NULL,
  end_date            DATE,

  -- Tracking
  next_due_date       DATE,
  progress_percentage NUMERIC DEFAULT 0,
  months_completed    INTEGER DEFAULT 0,
  months_remaining    INTEGER DEFAULT 0,

  -- Lifecycle status (8 states)
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('upcoming','active','due_soon','overdue','paused','completed','closed_early','refinanced')
  ),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_commitments" ON commitments
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for fast look‑ups
CREATE INDEX IF NOT EXISTS idx_commitments_user ON commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitments_status ON commitments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_commitments_due ON commitments(user_id, next_due_date);

-- ------------------------------------------------
-- Table: commitment_payments – payment history for a commitment
CREATE TABLE IF NOT EXISTS commitment_payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        NUMERIC NOT NULL,
  paid_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode  TEXT CHECK (payment_mode IN ('auto','manual','partial','prepayment')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commitment_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_payments" ON commitment_payments
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_payments_commitment ON commitment_payments(commitment_id);

-- ------------------------------------------------
-- Table: commitment_ai_insights – per‑commitment AI scores and recommendation
CREATE TABLE IF NOT EXISTS commitment_ai_insights (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id          UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affordability_score    NUMERIC,                -- 0‑100
  risk_score             NUMERIC,                -- 0‑100
  financial_impact_score NUMERIC,                -- -20 … +20
  health_score_impact    NUMERIC,                -- delta applied to overall health score
  projected_health_score NUMERIC,                -- resulting health score after this commitment
  recommendation         TEXT,
  generated_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commitment_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_insights" ON commitment_ai_insights
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_commitment ON commitment_ai_insights(commitment_id);

-- ------------------------------------------------
-- Table: commitment_notifications – UI notifications for commitment events
CREATE TABLE IF NOT EXISTS commitment_notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN (
    'due_soon','overdue','completed','milestone','health_impact','payment_recorded'
  )),
  message       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commitment_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_notifications" ON commitment_notifications
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON commitment_notifications(user_id, is_read);

-- End of 002_commitments.sql
