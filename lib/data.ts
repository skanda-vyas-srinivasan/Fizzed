import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { mockProfile, mockRatings, mockSodas } from "@/lib/mock-data";
import type { Rating, RatingBreakdown, Soda } from "@/lib/types";
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

export async function getHomeData() {
  if (!hasPublicSupabaseEnv()) {
    return { sodas: mockSodas, ratings: mockRatings, userCount: 1, sodaCount: mockSodas.length };
  }

  const supabase = createClient();

  const [sodas, ratings, profiles, sodaCount] = await Promise.all([
    supabase.from("sodas").select("*").eq("country", wikiCatalogCountry).not("image_url", "is", null).order("name").limit(8),
    supabase
      .from("ratings")
      .select("*, profiles(*), sodas(*)")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("sodas").select("id", { count: "exact", head: true }).eq("country", wikiCatalogCountry)
  ]);

  return {
    sodas: ((sodas.data || []) as Soda[]).filter(isWikiSoda),
    ratings: (ratings.data || []) as Rating[],
    userCount: profiles.count || 0,
    sodaCount: sodaCount.count || 0
  };
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
  if (!hasPublicSupabaseEnv()) return mockRatings.filter((rating) => rating.soda_id === id);

  const supabase = createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*, profiles(*)")
    .eq("soda_id", id)
    .order("created_at", { ascending: false })
    .limit(40);

  return (data || []) as Rating[];
}

export async function getRatingBreakdown(id: string): Promise<RatingBreakdown[]> {
  const reviews = await getSodaReviews(id);
  return [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: reviews.filter((review) => review.score === score).length
  }));
}

export async function getProfile(username: string) {
  if (!hasPublicSupabaseEnv()) return username === mockProfile.username ? mockProfile : null;

  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username).single();
  return data;
}

export async function getProfileRatings(profileId: string) {
  if (!hasPublicSupabaseEnv()) return profileId === mockProfile.id ? mockRatings : [];

  const supabase = createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*, sodas(*)")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(60);

  return (data || []) as Rating[];
}
