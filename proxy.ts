import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";

// Merchant dashboard routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/categories", "/products", "/settings"];
const LOGIN_ROUTE = "/login";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Check merchant authentication token from cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const userPayload = await verifyToken(token);
  const isAuthenticated = !!userPayload;

  // 2. Canonical redirect for www.igotthrift.in -> https://igotthrift.in
  const hostname = request.nextUrl.hostname;
  if (hostname === "www.igotthrift.in" || hostname === "www.igotthrift.com") {
    url.hostname = "igotthrift.in";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // 3. Root path handling based on domain
  const isAdminDomain = hostname.startsWith("admin.") || hostname.startsWith("admin.localhost");

  if (pathname === "/") {
    if (isAdminDomain) {
      url.pathname = isAuthenticated ? "/dashboard" : LOGIN_ROUTE;
      return NextResponse.redirect(url);
    } else {
      const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || "demo";
      url.pathname = `/store/${defaultSlug}`;
      return NextResponse.redirect(url);
    }
  }

  // 3. Protect merchant dashboard routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isLoginRoute = pathname === LOGIN_ROUTE;

  if (isProtectedRoute || isLoginRoute) {
    const isServerAction = request.headers.has("next-action");

    // Not logged in and trying to access protected dashboard page → redirect to login
    if (!isAuthenticated && isProtectedRoute && !isServerAction) {
      url.pathname = LOGIN_ROUTE;
      return NextResponse.redirect(url);
    }

    // Already logged in and trying to access login page → redirect to dashboard
    if (isAuthenticated && isLoginRoute && !isServerAction) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
