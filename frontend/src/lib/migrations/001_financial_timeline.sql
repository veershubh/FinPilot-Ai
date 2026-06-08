-- src/lib/migrations/001_financial_timeline.sql
CREATE TABLE IF NOT EXISTS financial_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('emi','loan','subscription','sip','investment','other')),
  provider TEXT,
  monthly_amount NUMERIC NOT NULL,
  principal_amount NUMERIC,
  interest_rate NUMERIC,
  start_date DATE NOT NULL,
  end_date DATE,
  total_months INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','overdue','paused','upcoming')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE financial_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timeline" ON financial_timeline
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_timeline_user ON financial_timeline(user_id);
