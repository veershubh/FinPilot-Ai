-- 005_assets_schema.sql
-- Creates `assets` and `asset_history` tables for the Assets module.
-- Column names match the TypeScript interfaces in src/types/assets.ts
-- and the Supabase queries in src/app/api/assets/route.ts.
-- Run this SQL in Supabase Dashboard → SQL Editor.

-- ==============================
-- assets table
-- ==============================
CREATE TABLE IF NOT EXISTS public.assets (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name             text        NOT NULL,
  category         text        NOT NULL DEFAULT 'other',
  institution      text,
  current_value    numeric     NOT NULL DEFAULT 0,
  invested_value   numeric     NOT NULL DEFAULT 0,
  returns_percentage numeric   NOT NULL DEFAULT 0,
  maturity_date    date,
  interest_rate    numeric     NOT NULL DEFAULT 0,
  units            numeric,
  notes            text,
  status           text        NOT NULL DEFAULT 'active',
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- asset_history table
-- ==============================
CREATE TABLE IF NOT EXISTS public.asset_history (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id         uuid        REFERENCES public.assets ON DELETE CASCADE NOT NULL,
  user_id          uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recorded_date    date        NOT NULL DEFAULT CURRENT_DATE,
  value            numeric     NOT NULL DEFAULT 0,
  invested_value   numeric     NOT NULL DEFAULT 0,
  created_at       timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- Indexes
-- ==============================
CREATE INDEX IF NOT EXISTS idx_assets_user_id       ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category      ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status        ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_created_at    ON public.assets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id      ON public.asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_user_id       ON public.asset_history(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_recorded_date ON public.asset_history(recorded_date);

-- ==============================
-- Auto-update updated_at trigger
-- ==============================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_assets_updated_at'
  ) THEN
    CREATE TRIGGER trigger_assets_updated_at
      BEFORE UPDATE ON public.assets
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ==============================
-- Row Level Security
-- ==============================
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can view own assets') THEN
    CREATE POLICY "Users can view own assets"   ON public.assets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can insert own assets') THEN
    CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can update own assets') THEN
    CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can delete own assets') THEN
    CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_history' AND policyname = 'Users can view own asset history') THEN
    CREATE POLICY "Users can view own asset history"   ON public.asset_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_history' AND policyname = 'Users can insert own asset history') THEN
    CREATE POLICY "Users can insert own asset history" ON public.asset_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================
-- Realtime
-- ==============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.asset_history;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
