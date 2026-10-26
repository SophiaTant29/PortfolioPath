import { NextResponse, type NextRequest } from "next/server";

/**
 * Public trial mode. The former account-backed portfolio screens depend on
 * Supabase and must not be reached from guest sessions. The independent demo
 * stores learning progress locally instead.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    path === "/portfolios" ||
    path.startsWith("/portfolios/") ||
    path === "/research" ||
    path.startsWith("/research/") ||
    path === "/forgot-password" ||
    path === "/update-password" ||
    path.startsWith("/auth/") ||
    path === "/logout"
  ) {
    return NextResponse.redirect(new URL("/demo", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
