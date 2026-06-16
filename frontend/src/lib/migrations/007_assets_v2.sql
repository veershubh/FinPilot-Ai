-- 007_assets_v2.sql – Assets module upgrade
-- =================================================

-- 1. Update Category Enum / Check Constraint
-- Drop the old constraint if it exists (Supabase creates them as table_column_check usually)
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_category_check;

-- Add new constraint including 'crypto'
ALTER TABLE assets ADD CONSTRAINT assets_category_check CHECK (category IN (
  'bank_account','fixed_deposit','mutual_fund','stock',
  'gold','real_estate','crypto','other'
));

-- 2. Create asset_history table
CREATE TABLE IF NOT EXISTS asset_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  recorded_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  value             NUMERIC NOT NULL DEFAULT 0,
  invested_value    NUMERIC NOT NULL DEFAULT 0,
  
  created_at        TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent multiple entries per asset per day to keep the chart clean
  UNIQUE(asset_id, recorded_date)
);

-- Enable RLS for asset_history
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_asset_history" ON asset_history
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_user_id ON asset_history(user_id);

-- 3. Create Trigger Function to Auto-Record History
CREATE OR REPLACE FUNCTION record_asset_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the history record for today
  INSERT INTO asset_history (asset_id, user_id, recorded_date, value, invested_value)
  VALUES (NEW.id, NEW.user_id, CURRENT_DATE, NEW.current_value, NEW.invested_value)
  ON CONFLICT (asset_id, recorded_date)
  DO UPDATE SET
    value = EXCLUDED.value,
    invested_value = EXCLUDED.invested_value;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT and UPDATE on current_value / invested_value
DROP TRIGGER IF EXISTS trigger_record_asset_history ON assets;
CREATE TRIGGER trigger_record_asset_history
AFTER INSERT OR UPDATE OF current_value, invested_value ON assets
FOR EACH ROW
EXECUTE FUNCTION record_asset_history();

-- 4. Initial historical backfill for existing assets (just the current value)
INSERT INTO asset_history (asset_id, user_id, recorded_date, value, invested_value)
SELECT id, user_id, CURRENT_DATE, current_value, invested_value FROM assets
ON CONFLICT (asset_id, recorded_date) DO NOTHING;

-- End of 007_assets_v2.sql
