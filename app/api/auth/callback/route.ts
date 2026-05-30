import { NextResponse } from "next/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.redirect(new URL("/auth/sign-in?message=Supabase%20is%20not%20configured.", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in?message=No%20auth%20code%20was%20returned.%20Try%20signing%20in%20again.", requestUrl.origin));
  }

  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(new URL(`/auth/sign-in?message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin));
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    return NextResponse.redirect(new URL("/auth/sign-in?message=Could%20not%20create%20a%20session.%20Try%20signing%20in%20again.", requestUrl.origin));
  }

  if (next === "/") {
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", data.user.id).single();
    if (!profile?.username) {
      return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
