// middleware.ts – Global middleware for Supabase auth session handling
// This file ensures every request updates the Supabase session cookie and enforces route protection.

import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Delegate to the shared session updater which also handles redirects.
  return updateSession(request);
}

// Apply middleware to all routes except API, static assets, and Next.js internals.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
