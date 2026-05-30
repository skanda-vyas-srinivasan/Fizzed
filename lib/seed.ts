import { createAdminClient } from "@/lib/supabase/admin";

type OffProduct = {
  product_name?: string;
  brands?: string;
  countries_tags?: string[];
  categories_tags?: string[];
  image_front_url?: string;
};

async function getSodaCount(supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { count, error } = await supabase.from("sodas").select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

const TAG_MAP = [
  "cola",
  "lemon",
  "lime",
  "orange",
  "ginger",
  "cream",
  "root-beer",
  "cherry",
  "grape",
  "tonic",
  "energy",
  "sparkling"
];

function cleanTag(tag: string) {
  return tag.replace(/^en:/, "").replaceAll("-", " ");
}

function titleCase(value: string) {
  return value
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeProduct(product: OffProduct) {
  const name = product.product_name?.trim();
  if (!name || name.length < 2) return null;

  const brand = product.brands?.split(",")[0]?.trim() || "Unknown";
  const countryTag = product.countries_tags?.[0] || "en:unknown";
  const categories = product.categories_tags || [];
  const flavorTags = categories
    .map(cleanTag)
    .filter((tag) => TAG_MAP.some((known) => tag.includes(known)))
    .map(titleCase)
    .filter(Boolean)
    .slice(0, 5);

  const category = flavorTags[0] || "Soda";

  return {
    name: name.slice(0, 160),
    brand: brand.slice(0, 120),
    country: titleCase(cleanTag(countryTag)) || "Unknown",
    category,
    flavor_tags: Array.from(new Set(flavorTags.length ? flavorTags : ["Soda"])),
    image_url: product.image_front_url || null
  };
}

export async function ensureSodasSeeded() {
  const supabase = createAdminClient();
  if (!supabase) return { seeded: false, reason: "missing-service-role" };

  let currentCount = 0;
  try {
    currentCount = await getSodaCount(supabase);
  } catch (error) {
    return { seeded: false, reason: error instanceof Error ? error.message : "count-failed" };
  }

  if (currentCount >= 5000) return { seeded: false, reason: "already-seeded", count: currentCount };

  const seen = new Set<string>();
  let imported = 0;

  for (let page = 1; page <= 220 && currentCount < 5000; page += 1) {
    const url = new URL("https://world.openfoodfacts.org/api/v2/search");
    url.searchParams.set("categories_tags", "sodas");
    url.searchParams.set("page_size", "100");
    url.searchParams.set("page", String(page));
    url.searchParams.set("fields", "product_name,brands,countries_tags,categories_tags,image_front_url");

    let response: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      response = await fetch(url, {
        headers: {
          "User-Agent": "Fizzed/0.1 (local development soda rating app)"
        },
        next: { revalidate: 60 * 60 * 24 }
      });

      if (response.ok && response.headers.get("content-type")?.includes("application/json")) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }

    if (!response?.ok || !response.headers.get("content-type")?.includes("application/json")) continue;

    const payload = (await response.json()) as { products?: OffProduct[] };
    const rows = (payload.products || [])
      .map(normalizeProduct)
      .filter((row): row is NonNullable<ReturnType<typeof normalizeProduct>> => Boolean(row))
      .filter((row) => {
        const key = `${row.name}|${row.brand}|${row.country}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (!rows.length) continue;

    const { error } = await supabase.from("sodas").upsert(rows, {
      onConflict: "name,brand,country",
      ignoreDuplicates: true
    });

    if (error) return { seeded: imported > 0, reason: error.message, imported, count: currentCount };
    imported += rows.length;
    currentCount = await getSodaCount(supabase);
  }

  return { seeded: imported > 0, reason: "completed", imported, count: currentCount };
}
