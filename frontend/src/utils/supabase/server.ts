// src/utils/supabase/server.ts

/**
 * Server‑side Supabase client wrapper for Next.js 16 app router.
 * Uses cookies from the incoming request to forward the JWT token.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const getServerSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component context without a cookie store – ignore.
          }
        },
      },
    }
  );
};
