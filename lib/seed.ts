import { createAdminClient } from "@/lib/supabase/admin";

const wikiCatalogCountry = "Global";

export async function ensureSodasSeeded() {
  const supabase = createAdminClient();
  if (!supabase) return { seeded: false, reason: "missing-service-role" };

  const { count, error } = await supabase.from("sodas").select("id", { count: "exact", head: true }).eq("country", wikiCatalogCountry);
  if (error) return { seeded: false, reason: error.message };

  return {
    seeded: false,
    reason: count ? "wiki-catalog-ready" : "run-npm-run-seed-fandom",
    count: count || 0
  };
}
