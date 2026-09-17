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

// If you want to view the dashboard without being logged in, you can bypass
// the middleware for local testing by adding a condition to check for the development environment.
// This allows you to access the dashboard and signup pages without authentication during development.

// import { NextResponse, type NextRequest } from "next/server";
// import { updateSession } from "@/src/lib/supabase/server";

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;

//   // Bypass for local testing on specific routes or entire dev environment
//   if (
//     process.env.NODE_ENV === "development" &&
//     (path.startsWith("/dashboard") || path.startsWith("/signup"))
//   ) {
//     return NextResponse.next();
//   }

//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };
