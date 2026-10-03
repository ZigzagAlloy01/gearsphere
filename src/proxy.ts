import { type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/server";

// Refresh the session and protect private app routes.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Protect all routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
