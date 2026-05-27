import type { NextRequest } from "next/server";
import { updateSession } from "./src/utils/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
