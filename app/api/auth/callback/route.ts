import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { hasPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function redirectWithCookies(url: URL, cookiesToSet: CookieToSet[]) {
  const response = NextResponse.redirect(url);
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const cookiesToSet: CookieToSet[] = [];

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.redirect(new URL("/auth/sign-in?message=Supabase%20is%20not%20configured.", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in?message=No%20auth%20code%20was%20returned.%20Try%20signing%20in%20again.", requestUrl.origin));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((cookie) => {
              const [name, ...value] = cookie.trim().split("=");
              return { name, value: value.join("=") };
            })
            .filter((cookie) => cookie.name) || [];
        },
        setAll(nextCookies: CookieToSet[]) {
          cookiesToSet.push(...nextCookies);
        }
      }
    }
  );

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
      return redirectWithCookies(new URL("/onboarding", requestUrl.origin), cookiesToSet);
    }
  }

  return redirectWithCookies(new URL(next, requestUrl.origin), cookiesToSet);
}
