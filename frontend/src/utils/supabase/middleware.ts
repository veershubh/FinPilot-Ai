import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Validate Supabase env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[Supabase Middleware] URL exists:", !!supabaseUrl);
  console.log("[Supabase Middleware] Key exists:", !!supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Supabase Middleware] Missing environment variables");
    throw new Error("Supabase environment variables are missing.");
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/commitments") ||
    pathname.startsWith("/emi-analyzer") ||
    pathname.startsWith("/budget-planner") ||
    pathname.startsWith("/insights") ||
    pathname.startsWith("/ai-assistant") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/liabilities") ||
    pathname.startsWith("/strategy");

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
