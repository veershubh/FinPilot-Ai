-- 003_assets.sql – Assets module schema
-- =================================================

CREATE TABLE IF NOT EXISTS assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name              TEXT NOT NULL,
  category          TEXT NOT NULL CHECK (category IN (
    'bank_account','fixed_deposit','mutual_fund','stock',
    'gold','real_estate','other'
  )),
  institution       TEXT,

  -- Financial data
  current_value     NUMERIC NOT NULL DEFAULT 0,
  invested_value    NUMERIC NOT NULL DEFAULT 0,
  returns_percentage NUMERIC DEFAULT 0,
  maturity_date     DATE,
  interest_rate     NUMERIC DEFAULT 0,
  units             NUMERIC,
  notes             TEXT,

  -- Status
  status            TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active','matured','sold')
  ),

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_assets" ON assets
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(user_id, category);

-- End of 003_assets.sql
