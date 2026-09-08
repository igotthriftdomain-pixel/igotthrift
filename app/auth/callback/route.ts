import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const rawNext = searchParams.get("next") ?? "/reset-password";
  const isRelative = rawNext.startsWith("/") && !rawNext.startsWith("//");
  const nextPath = isRelative ? rawNext : "/reset-password";

  if (token) {
    const forwardUrl = new URL(nextPath, origin);
    forwardUrl.searchParams.set("token", token);
    return NextResponse.redirect(forwardUrl);
  }

  // Redirect to reset password page directly or login page if no token
  const forwardUrl = new URL(nextPath, origin);
  return NextResponse.redirect(forwardUrl);
}
