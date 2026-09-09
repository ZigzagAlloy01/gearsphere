import { auth } from "@/src/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  // If trying to access the dashboard without being logged in, redirect to login page
  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return Response.redirect(loginUrl)
  }
})

// Protect all routes inside the dashboard folder
export const config = {
  matcher: ["/dashboard/:path*"],
}
