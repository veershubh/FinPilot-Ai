// src/lib/supabaseClient.ts

/**
 * Centralised Supabase client for browser usage.
 * Uses the @supabase/ssr helper which works with Next.js 16 app router.
 */
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Re-export for convenience
export const getSupabase = () => supabase;
