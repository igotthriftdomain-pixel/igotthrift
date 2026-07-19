import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/reset-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardUrl = new URL(next, origin);
      return NextResponse.redirect(forwardUrl);
    }
  }

  // Return user to login with error if token exchange fails
  const errorUrl = new URL("/login?error=Invalid%20or%20expired%20auth%20link", origin);
  return NextResponse.redirect(errorUrl);
}
