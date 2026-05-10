import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Public Routes
  const publicRoutes = ["/"];

  // Protected Routes
  const protectedRoutes = ["/dashboard"];

  // Check Route Types
  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If token exists and user tries to access login page
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If no token and user tries to access protected page
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Ignore:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - images/files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};