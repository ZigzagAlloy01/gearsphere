import { type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/server";

// If trying to access the dashboard without being logged in, redirect to login page
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Protect all routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
