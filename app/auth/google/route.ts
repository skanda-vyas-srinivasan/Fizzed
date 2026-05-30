import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function siteUrl(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl(request)}/api/auth/callback`
    }
  });

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message || "Could not start Google sign-in.");
    return NextResponse.redirect(new URL(`/auth/sign-in?message=${message}`, request.url));
  }

  return NextResponse.redirect(data.url);
}
