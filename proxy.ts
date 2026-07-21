import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Merchant dashboard routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/categories", "/products", "/settings"];
const LOGIN_ROUTE = "/login";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Root path handling based on domain
  const hostname = request.nextUrl.hostname;
  const isAdminDomain = hostname.startsWith("admin.");

  if (pathname === "/") {
    if (isAdminDomain) {
      const { user, supabaseResponse } = await updateSession(request);
      url.pathname = user ? "/dashboard" : LOGIN_ROUTE;
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    } else {
      const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || "demo";
      url.pathname = `/store/${defaultSlug}`;
      return NextResponse.redirect(url);
    }
  }

  // 2. Protect merchant dashboard routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isLoginRoute = pathname === LOGIN_ROUTE;

  if (isProtectedRoute || isLoginRoute) {
    const { user, supabaseResponse } = await updateSession(request);
    const isServerAction = request.headers.has("next-action");

    // Not logged in and trying to access dashboard via page request → redirect to login
    if (!user && isProtectedRoute && !isServerAction) {
      url.pathname = LOGIN_ROUTE;
      return NextResponse.redirect(url);
    }

    // Already logged in and trying to access login → redirect to dashboard
    if (user && isLoginRoute && !isServerAction) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
