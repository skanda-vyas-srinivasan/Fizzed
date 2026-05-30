import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookiesToSet: CookieToSet[] = [];
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestUrl.origin}/api/auth/callback`
    }
  });

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message || "Could not start Google sign-in.");
    return NextResponse.redirect(new URL(`/auth/sign-in?message=${message}`, request.url));
  }

  const response = NextResponse.redirect(data.url);
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
