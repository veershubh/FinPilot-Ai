// src/utils/supabase/server.ts

/**
 * Server‑side Supabase client wrapper for Next.js 16 app router.
 * Uses cookies from the incoming request to forward the JWT token.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const getServerSupabase = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[Supabase Server] URL exists:", !!supabaseUrl);
  console.log("[Supabase Server] Key exists:", !!supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Supabase Server] Missing environment variables");
    throw new Error("Supabase environment variables are missing.");
  }

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });
};

/**
 * For API Route Handlers — reads cookies directly from the incoming Request.
 *
 * In Next.js 16, `cookies()` from `next/headers` does not reliably expose
 * auth cookies inside route handlers for client-side fetch() calls.
 * Parsing cookies from the raw Request header is the reliable approach
 * (same pattern used by the working EMI planner route).
 */
export function getRouteHandlerSupabase(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) return [];
        return cookieHeader.split("; ").map((c) => {
          const [name, ...rest] = c.split("=");
          return { name, value: rest.join("=") };
        });
      },
    },
  });
}