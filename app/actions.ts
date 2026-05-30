"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/sign-in?message=${encodeURIComponent(error.message)}`);
  redirect("/");
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const username = String(formData.get("username") || "").trim();
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/api/auth/callback`,
      data: { username }
    }
  });

  if (error) redirect(`/auth/sign-in?message=${encodeURIComponent(error.message)}`);
  redirect("/onboarding");
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl()}/api/auth/callback`
    }
  });

  if (error) redirect(`/auth/sign-in?message=${encodeURIComponent(error.message)}`);
  redirect(data.url);
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const username = String(formData.get("username") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const location = String(formData.get("location") || "").trim();

  const { error } = await supabase.from("profiles").upsert({
    id: data.user.id,
    username,
    bio,
    location
  });

  if (error) redirect(`/onboarding?message=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  redirect(`/profile/${username}`);
}

export async function createRating(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const sodaId = String(formData.get("soda_id") || "");
  const score = Number(formData.get("score") || 0);
  const reviewText = String(formData.get("review_text") || "").trim();

  const { error } = await supabase.from("ratings").insert({
    user_id: data.user.id,
    soda_id: sodaId,
    score,
    review_text: reviewText
  });

  if (error) redirect(`/log?message=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath(`/soda/${sodaId}`);
  redirect(`/soda/${sodaId}`);
}
