import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { mockDiscussionPosts, mockProfile, mockRatings, mockSodaLists, mockSodas } from "@/lib/mock-data";
import type { DiscussionPost, FollowState, Profile, Rating, RatingBreakdown, Soda, SodaList } from "@/lib/types";
import wikiSodaNames from "@/lib/wiki-soda-names.json";

const wikiNameSet = new Set<string>((wikiSodaNames as string[]).map((name) => name.toLowerCase()));
const wikiCatalogCountry = "Global";

function isWikiSoda(soda: Pick<Soda, "name" | "country">) {
  return soda.country === wikiCatalogCountry && wikiNameSet.has(soda.name.toLowerCase());
}

export const getCurrentUser = cache(async () => {
  if (!hasPublicSupabaseEnv()) return null;
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

export async function getCurrentProfileId() {
  const profile = await getCurrentProfile();
  return profile?.id || null;
}

export async function getHomeData() {
  if (!hasPublicSupabaseEnv()) {
    return { sodas: shuffle(mockSodas.filter((soda) => soda.image_url)).slice(0, 24), ratings: mockRatings, userCount: 1, sodaCount: mockSodas.length };
  }

  const supabase = createClient();

  const [randomSodas, fallbackSodas, globalRatings, profiles, sodaCount] = await Promise.all([
    supabase.rpc("random_image_sodas", { result_limit: 24 }),
    supabase.from("sodas").select("*").eq("country", wikiCatalogCountry).not("image_url", "is", null).order("created_at", { ascending: false }).limit(80),
    supabase
      .from("ratings")
      .select("*, profiles(*), sodas(*)")
      .neq("review_text", "")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("sodas").select("id", { count: "exact", head: true }).eq("country", wikiCatalogCountry)
  ]);
  const sodaRows = randomSodas.error ? shuffle((fallbackSodas.data || []) as Soda[]).slice(0, 24) : (randomSodas.data || []);

  return {
    sodas: (sodaRows as Soda[]).filter(isWikiSoda),
    ratings: (globalRatings.data || []) as Rating[],
    userCount: profiles.count || 0,
    sodaCount: sodaCount.count || 0
  };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function getSodas(filters: { q?: string; brand?: string; country?: string; category?: string }) {
  if (!hasPublicSupabaseEnv()) {
    return mockSodas.filter((soda) => {
      const matchesQuery = filters.q ? `${soda.name} ${soda.brand}`.toLowerCase().includes(filters.q.toLowerCase()) : true;
      const matchesBrand = filters.brand ? soda.brand === filters.brand : true;
      const matchesCountry = filters.country ? soda.country === filters.country : true;
      const matchesCategory = filters.category ? soda.category === filters.category : true;
      return matchesQuery && matchesBrand && matchesCountry && matchesCategory;
    });
  }

  const supabase = createClient();
  let query = supabase.from("sodas").select("*").eq("country", wikiCatalogCountry).order("name").limit(2000);

  if (filters.q) query = query.or(`name.ilike.%${filters.q}%,brand.ilike.%${filters.q}%`);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.category) query = query.eq("category", filters.category);

  const { data } = await query;
  return ((data || []) as Soda[]).filter(isWikiSoda);
}

export async function getProfiles(filters: { q?: string }, limit = 24) {
  if (!hasPublicSupabaseEnv()) {
    const q = filters.q?.toLowerCase();
    return q && mockProfile.username?.toLowerCase().includes(q) ? [mockProfile] : [];
  }

  if (!filters.q?.trim()) return [];

  const supabase = createClient();
  const q = filters.q.trim();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${q}%,bio.ilike.%${q}%,location.ilike.%${q}%`)
    .not("username", "is", null)
    .order("username")
    .limit(limit);

  return (data || []) as Profile[];
}

export async function getTopSodas(limit = 80) {
  if (!hasPublicSupabaseEnv()) {
    return [...mockSodas]
      .filter((soda) => soda.total_ratings > 0 || soda.image_url)
      .sort((a, b) => b.avg_rating - a.avg_rating || b.total_ratings - a.total_ratings)
      .slice(0, limit);
  }

  const supabase = createClient();
  const [rated, fallback] = await Promise.all([
    supabase
      .from("sodas")
      .select("*")
      .eq("country", wikiCatalogCountry)
      .gt("total_ratings", 0)
      .order("avg_rating", { ascending: false })
      .order("total_ratings", { ascending: false })
      .limit(limit),
    supabase
      .from("sodas")
      .select("*")
      .eq("country", wikiCatalogCountry)
      .eq("total_ratings", 0)
      .not("image_url", "is", null)
      .order("name")
      .limit(limit)
  ]);

  const seen = new Set<string>();
  const rows = [...((rated.data || []) as Soda[]), ...((fallback.data || []) as Soda[])].filter((soda) => {
    if (seen.has(soda.id)) return false;
    seen.add(soda.id);
    return true;
  });

  return rows.filter(isWikiSoda).slice(0, limit);
}

export async function getPopularSodas(limit = 80) {
  if (!hasPublicSupabaseEnv()) {
    return [...mockSodas].sort((a, b) => b.total_ratings - a.total_ratings || b.avg_rating - a.avg_rating).slice(0, limit);
  }

  const supabase = createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("ratings")
    .select("soda_id, sodas(*)")
    .gte("created_at", monthStart.toISOString())
    .limit(2000);

  const counts = new Map<string, { soda: Soda; count: number }>();
  for (const row of data || []) {
    const soda = row.sodas as unknown as Soda | null;
    if (!soda || !isWikiSoda(soda)) continue;
    const current = counts.get(soda.id);
    counts.set(soda.id, { soda, count: (current?.count || 0) + 1 });
  }

  if (counts.size) {
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count || b.soda.avg_rating - a.soda.avg_rating)
      .map((entry) => entry.soda)
      .slice(0, limit);
  }

  const { data: fallback } = await supabase
    .from("sodas")
    .select("*")
    .eq("country", wikiCatalogCountry)
    .order("total_ratings", { ascending: false })
    .order("avg_rating", { ascending: false })
    .limit(limit);

  return ((fallback || []) as Soda[]).filter(isWikiSoda);
}

export async function getNewSodas(limit = 80) {
  if (!hasPublicSupabaseEnv()) return mockSodas.slice(0, limit);

  const supabase = createClient();
  const { data } = await supabase.from("sodas").select("*").eq("country", wikiCatalogCountry).order("created_at", { ascending: false }).limit(limit);
  return ((data || []) as Soda[]).filter(isWikiSoda);
}

export async function getDiscussionPosts(limit = 40) {
  if (!hasPublicSupabaseEnv()) return sortDiscussionByActivity(mockDiscussionPosts).slice(0, limit);

  const supabase = createClient();
  const { data } = await supabase
    .from("discussion_posts")
    .select("*, profiles(*), replies:discussion_replies(*, profiles(*))")
    .order("created_at", { ascending: false })
    .limit(limit);

  return sortDiscussionByActivity((data || []) as DiscussionPost[]).slice(0, limit);
}

function sortDiscussionByActivity(posts: DiscussionPost[]) {
  return [...posts].sort((a, b) => latestDiscussionActivity(b).getTime() - latestDiscussionActivity(a).getTime());
}

function latestDiscussionActivity(post: DiscussionPost) {
  const times = [post.created_at, ...(post.replies || []).map((reply) => reply.created_at)].map((date) => new Date(date).getTime());
  return new Date(Math.max(...times));
}

export async function getDiscussionPost(id: string) {
  if (!hasPublicSupabaseEnv()) return mockDiscussionPosts.find((post) => post.id === id) || null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("discussion_posts")
    .select("*, profiles(*), replies:discussion_replies(*, profiles(*))")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as DiscussionPost;
}

export async function getSodaLists(limit = 40) {
  if (!hasPublicSupabaseEnv()) return mockSodaLists;

  const supabase = createClient();
  const { data } = await supabase.from("soda_lists").select("*, profiles(*)").order("created_at", { ascending: false }).limit(limit);
  return (data || []) as SodaList[];
}

export async function getBrowseFacets() {
  if (!hasPublicSupabaseEnv()) {
    return {
      brands: Array.from(new Set(mockSodas.map((soda) => soda.brand))).sort(),
      countries: Array.from(new Set(mockSodas.map((soda) => soda.country))).sort(),
      categories: Array.from(new Set(mockSodas.map((soda) => soda.category))).sort()
    };
  }

  const supabase = createClient();
  const { data } = await supabase.from("sodas").select("name,brand,country,category").eq("country", wikiCatalogCountry).limit(20000);
  const rows = ((data || []) as Array<Pick<Soda, "name" | "brand" | "country" | "category">>).filter(isWikiSoda);

  return {
    brands: Array.from(new Set(rows.map((row) => row.brand).filter((brand) => brand && brand !== "Unknown"))).sort().slice(0, 40),
    countries: Array.from(new Set(rows.map((row) => row.country).filter(Boolean))).sort().slice(0, 40),
    categories: Array.from(new Set(rows.map((row) => row.category).filter((category) => category && category !== "Unknown"))).sort().slice(0, 40)
  };
}

export async function getSoda(id: string) {
  if (!hasPublicSupabaseEnv()) return mockSodas.find((soda) => soda.id === id) || null;

  const supabase = createClient();
  const { data } = await supabase.from("sodas").select("*").eq("id", id).single();
  return data as Soda | null;
}

export async function getSodaReviews(id: string) {
  if (!hasPublicSupabaseEnv()) return mockRatings.filter((rating) => rating.soda_id === id && rating.review_text?.trim());

  const supabase = createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*, profiles(*)")
    .eq("soda_id", id)
    .neq("review_text", "")
    .order("created_at", { ascending: false })
    .limit(40);

  return (data || []) as Rating[];
}

export async function getCurrentUserRatingForSoda(sodaId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasPublicSupabaseEnv()) {
    return mockRatings.find((rating) => rating.user_id === user.id && rating.soda_id === sodaId) || null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", user.id)
    .eq("soda_id", sodaId)
    .order("created_at", { ascending: false })
    .limit(1);

  return ((data || [])[0] as Rating | undefined) || null;
}

export async function getRatingBreakdown(id: string): Promise<RatingBreakdown[]> {
  if (!hasPublicSupabaseEnv()) {
    const ratings = mockRatings.filter((rating) => rating.soda_id === id);
    return [5, 4, 3, 2, 1].map((score) => ({
      score,
      count: ratings.filter((rating) => rating.score === score).length
    }));
  }

  const supabase = createClient();
  const { data } = await supabase.from("ratings").select("score").eq("soda_id", id);
  const ratings = (data || []) as Array<Pick<Rating, "score">>;

  return [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: ratings.filter((rating) => rating.score === score).length
  }));
}

export async function getProfile(username: string) {
  if (!hasPublicSupabaseEnv()) return username === mockProfile.username ? mockProfile : null;

  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username).single();
  return data;
}

export async function getFollowState(profileId: string): Promise<FollowState> {
  if (!hasPublicSupabaseEnv()) {
    return { followers: 0, following: 0, isFollowing: false };
  }

  const currentProfileId = await getCurrentProfileId();
  const supabase = createClient();
  const [followers, following, relation] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
    currentProfileId
      ? supabase.from("follows").select("follower_id").eq("follower_id", currentProfileId).eq("following_id", profileId).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  return {
    followers: followers.count || 0,
    following: following.count || 0,
    isFollowing: Boolean(relation.data)
  };
}

export async function getProfileFollowers(profileId: string, limit?: number) {
  if (!hasPublicSupabaseEnv()) return [];

  const supabase = createClient();
  let query = supabase.from("follows").select("follower_id").eq("following_id", profileId);
  if (limit) query = query.limit(limit);
  const { data: followRows } = await query;
  const ids = (followRows || []).map((row) => row.follower_id).filter(Boolean);
  if (!ids.length) return [];

  const { data } = await supabase.from("profiles").select("*").in("id", ids).order("username");
  return (data || []) as Profile[];
}

export async function getProfileFollowing(profileId: string, limit?: number) {
  if (!hasPublicSupabaseEnv()) return [];

  const supabase = createClient();
  let query = supabase.from("follows").select("following_id").eq("follower_id", profileId);
  if (limit) query = query.limit(limit);
  const { data: followRows } = await query;
  const ids = (followRows || []).map((row) => row.following_id).filter(Boolean);
  if (!ids.length) return [];

  const { data } = await supabase.from("profiles").select("*").in("id", ids).order("username");
  return (data || []) as Profile[];
}

export async function getProfileRatings(profileId: string, limit = 60) {
  if (!hasPublicSupabaseEnv()) return profileId === mockProfile.id ? mockRatings : [];

  const supabase = createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*, sodas(*)")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []) as Rating[];
}

export async function getProfileLists(profileId: string) {
  if (!hasPublicSupabaseEnv()) return profileId === mockProfile.id ? mockSodaLists : [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("soda_lists")
    .select("*, profiles(*)")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return [];
  return (data || []) as SodaList[];
}

export async function getProfileDiscussionPosts(profileId: string, limit = 8) {
  if (!hasPublicSupabaseEnv()) return profileId === mockProfile.id ? mockDiscussionPosts : [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("discussion_posts")
    .select("*, profiles(*), replies:discussion_replies(*, profiles(*))")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as DiscussionPost[];
}
