-- 008_ai_assistant_schema.sql
-- Creates `ai_conversations` and `ai_messages` tables for the AI Assistant module.
-- Column names match the TypeScript interfaces in src/types/ai-assistant.ts
-- and the Supabase queries in src/app/api/ai-assistant/route.ts
-- and src/app/api/ai-assistant/chat/route.ts.
-- Run this SQL in Supabase Dashboard → SQL Editor.

-- ==============================
-- ai_conversations table
-- ==============================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title       text        NOT NULL DEFAULT 'New Conversation',
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- ai_messages table
-- ==============================
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   uuid        REFERENCES public.ai_conversations ON DELETE CASCADE NOT NULL,
  user_id           uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role              text        NOT NULL CHECK (role IN ('user', 'assistant')),
  content           text        NOT NULL,
  created_at        timestamptz DEFAULT now() NOT NULL
);

-- ==============================
-- Indexes
-- ==============================
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id    ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id         ON public.ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at      ON public.ai_messages(created_at);

-- ==============================
-- Auto-update updated_at trigger
-- (reuses the set_updated_at() function created in 005_assets_schema.sql)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_ai_conversations_updated_at'
  ) THEN
    CREATE TRIGGER trigger_ai_conversations_updated_at
      BEFORE UPDATE ON public.ai_conversations
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ==============================
-- Row Level Security
-- ==============================
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can view own conversations') THEN
    CREATE POLICY "Users can view own conversations"   ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can insert own conversations') THEN
    CREATE POLICY "Users can insert own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can update own conversations') THEN
    CREATE POLICY "Users can update own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can delete own conversations') THEN
    CREATE POLICY "Users can delete own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_messages' AND policyname = 'Users can view own messages') THEN
    CREATE POLICY "Users can view own messages"   ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_messages' AND policyname = 'Users can insert own messages') THEN
    CREATE POLICY "Users can insert own messages" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================
-- Realtime
-- ==============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_messages;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
