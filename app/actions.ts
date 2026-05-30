"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function readableError(error: { message?: string; code?: string } | null | undefined, fallback = "Something went wrong. Try again.") {
  const message = error?.message || fallback;
  const lower = message.toLowerCase();
  const code = error?.code || "";

  if (message.includes("profiles_username_key") || lower.includes("duplicate key") || code === "23505") return "That username is already taken.";
  if (lower.includes("row-level security") || lower.includes("rls") || code === "42501") return "You do not have permission to do that.";
  if (lower.includes("violates foreign key") || code === "23503") return "That item no longer exists. Refresh and try again.";
  if (lower.includes("check constraint") || code === "23514") return "One of those values is not allowed.";
  if (lower.includes("schema cache") || lower.includes("could not find the table")) return "This feature is not installed in Supabase yet. Run the matching SQL setup file, then try again.";
  if (lower.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (lower.includes("email not confirmed")) return "Confirm your email before signing in.";
  if (lower.includes("user already registered")) return "An account already exists for that email.";
  if (lower.includes("password")) return "That password is not accepted. Try a longer password.";
  if (lower.includes("network") || lower.includes("fetch failed")) return "Network error. Check your connection and try again.";

  return message.length > 160 ? fallback : message;
}

function encodedError(error: { message?: string; code?: string } | null | undefined, fallback?: string) {
  return encodeURIComponent(readableError(error, fallback));
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/sign-in?message=${encodedError(error)}`);
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

  if (error) redirect(`/auth/sign-in?message=${encodedError(error)}`);
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

  if (error) redirect(`/auth/sign-in?message=${encodedError(error)}`);
  redirect(data.url);
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function followProfile(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const followingId = String(formData.get("following_id") || "");
  const username = String(formData.get("username") || "");

  const { error } = await supabase.from("follows").insert({
    follower_id: data.user.id,
    following_id: followingId
  });

  if (error) redirect(`/profile/${username}?message=${encodedError(error)}`);
  revalidatePath("/");
  revalidatePath(`/profile/${username}`);
  redirect(`/profile/${username}`);
}

export async function unfollowProfile(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const followingId = String(formData.get("following_id") || "");
  const username = String(formData.get("username") || "");

  const { error } = await supabase.from("follows").delete().eq("follower_id", data.user.id).eq("following_id", followingId);

  if (error) redirect(`/profile/${username}?message=${encodedError(error)}`);
  revalidatePath("/");
  revalidatePath(`/profile/${username}`);
  redirect(`/profile/${username}`);
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const username = String(formData.get("username") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const location = String(formData.get("location") || "").trim();

  const { data: existingProfile } = await supabase.from("profiles").select("id,bio,location,avatar_url").eq("id", data.user.id).maybeSingle();
  const userAvatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;
  const payload = {
    username,
    bio: bio || existingProfile?.bio || "",
    location: location || existingProfile?.location || "",
    avatar_url: userAvatar || existingProfile?.avatar_url || null
  };

  const { error } = existingProfile
    ? await supabase.from("profiles").update(payload).eq("id", data.user.id)
    : await supabase.from("profiles").insert({ id: data.user.id, ...payload });

  if (error) redirect(`/onboarding?message=${encodedError(error)}`);
  revalidatePath("/");
  redirect(`/profile/${username}`);
}

export async function createRating(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const sodaId = String(formData.get("soda_id") || "");
  const rawScore = String(formData.get("score") || "");
  const score = rawScore === "nr" ? null : Number(rawScore);
  const reviewText = String(formData.get("review_text") || "").trim();

  const { data: existingRating } = await supabase
    .from("ratings")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("soda_id", sodaId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    score,
    review_text: reviewText
  };

  const { error } = existingRating
    ? await supabase.from("ratings").update(payload).eq("id", existingRating.id)
    : await supabase.from("ratings").insert({
        user_id: data.user.id,
        soda_id: sodaId,
        ...payload
      });

  if (error) redirect(`/log?message=${encodedError(error)}`);
  revalidatePath("/");
  revalidatePath(`/soda/${sodaId}`);
  redirect(`/soda/${sodaId}`);
}

export async function createInlineRating(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const sodaId = String(formData.get("soda_id") || "");
  const rawScore = String(formData.get("score") || "");
  const score = rawScore === "nr" ? null : Number(rawScore);
  const reviewText = String(formData.get("review_text") || "").trim();

  const { data: existingRating } = await supabase
    .from("ratings")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("soda_id", sodaId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    score,
    review_text: reviewText
  };

  const { error } = existingRating
    ? await supabase.from("ratings").update(payload).eq("id", existingRating.id)
    : await supabase.from("ratings").insert({
        user_id: data.user.id,
        soda_id: sodaId,
        ...payload
      });

  if (error) redirect(`/?message=${encodedError(error)}`);
  revalidatePath("/");
  revalidatePath(`/soda/${sodaId}`);
}

export async function createDiscussionPost(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  const { data: post, error } = await supabase
    .from("discussion_posts")
    .insert({
      user_id: data.user.id,
      title,
      body
    })
    .select("id")
    .single();

  if (error) redirect(`/discussion?message=${encodedError(error)}`);
  revalidatePath("/discussion");
  redirect(`/discussion/${post.id}`);
}

export async function createDiscussionReply(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const postId = String(formData.get("post_id") || "");
  const body = String(formData.get("body") || "").trim();
  const quoteAuthor = String(formData.get("quote_author") || "").trim();
  const quoteText = String(formData.get("quote_text") || "").trim();
  const formattedBody =
    quoteAuthor && quoteText
      ? [`> @${quoteAuthor}`, ...quoteText.split("\n").slice(0, 4).map((line) => `> ${line}`), "", body].join("\n").trim()
      : body;

  const { error } = await supabase.from("discussion_replies").insert({
    post_id: postId,
    user_id: data.user.id,
    body: formattedBody
  });

  if (error) redirect(`/discussion?message=${encodedError(error)}`);
  revalidatePath("/discussion");
  revalidatePath(`/discussion/${postId}`);
  redirect(`/discussion/${postId}`);
}

export async function createSodaList(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const { error } = await supabase.from("soda_lists").insert({
    user_id: data.user.id,
    title,
    description
  });

  if (error) redirect(`/lists?message=${encodedError(error)}`);
  revalidatePath("/lists");
  redirect("/lists");
}
