import type { Soda } from "@/lib/types";

const PACKAGING_PATTERNS = [
  /\b\d+(\.\d+)?\s?(ml|cl|l|litre|liter|oz|fl oz|floz)\b/g,
  /\b\d+\s?(x|pack|pk|ct|count)\b/g,
  /\b(x\s?\d+)\b/g,
  /\b(pet|bottle|bottles|can|cans|glass|plastic|multipack|pack|case|single|drink)\b/g
];

const BRAND_ALIASES: Array<[RegExp, string]> = [
  [/\bcoke\b/g, "coca cola"],
  [/\bcoca\s+cola\b/g, "coca cola"],
  [/\bdr\s+pepper\b/g, "dr pepper"],
  [/\bdoctor\s+pepper\b/g, "dr pepper"]
];

const DISPLAY_ALIASES: Array<[RegExp, string]> = [
  [/\bcoca cola\b/g, "coca-cola"],
  [/\bcoke\b/g, "coca-cola"],
  [/\bzero zero sugar\b/g, "zero sugar"],
  [/\bzero sucre\b/g, "zero sugar"],
  [/\bsans sucres\b/g, "zero sugar"],
  [/\bsin azucar\b/g, "zero sugar"]
];

function normalizeText(value: string) {
  let text = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ");

  for (const pattern of PACKAGING_PATTERNS) {
    text = text.replace(pattern, " ");
  }

  for (const [pattern, replacement] of BRAND_ALIASES) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      if (part === "and") return "&";
      if (part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

export type GroupedSoda = Soda & {
  variant_count: number;
  variant_countries: string[];
};

export function canonicalNameForSoda(soda: Soda) {
  let name = normalizeText(soda.name);
  let brand = normalizeText(soda.brand);

  for (const [pattern, replacement] of DISPLAY_ALIASES) {
    name = name.replace(pattern, replacement);
    brand = brand.replace(pattern, replacement);
  }

  name = name.replace(/\bzero zero sugar\b/g, "zero sugar").replace(/\s+/g, " ").trim();
  brand = brand.replace(/\s+/g, " ").trim();

  const brandWords = brand.split(" ").filter(Boolean);
  const nameWords = name.split(" ").filter(Boolean);
  const nameWithoutBrand = nameWords.slice(0, brandWords.length).join(" ") === brand ? nameWords.slice(brandWords.length).join(" ") : name;
  const display = brand && nameWithoutBrand ? `${titleCase(brand)} ${titleCase(nameWithoutBrand)}` : titleCase(name || soda.name);

  return display.replace(/\bCoca Cola\b/g, "Coca-Cola").replace(/\bDr Pepper\b/g, "Dr Pepper");
}

export function canonicalKeyForSoda(soda: Soda) {
  return canonicalNameForSoda(soda).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function scoreRepresentative(soda: Soda) {
  let score = soda.total_ratings * 10 + Number(soda.avg_rating || 0);
  if (soda.image_url) score += 1000;
  if (["United States", "United Kingdom", "Canada"].includes(soda.country)) score += 100;
  if (soda.brand !== "Unknown") score += 50;
  return score;
}

export function groupSodas(sodas: Soda[]): GroupedSoda[] {
  const groups = new Map<string, Soda[]>();

  for (const soda of sodas) {
    const key = canonicalKeyForSoda(soda);
    const existing = groups.get(key) || [];
    existing.push(soda);
    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .map((rows) => {
      const representative = rows.slice().sort((a, b) => scoreRepresentative(b) - scoreRepresentative(a))[0];
      const countries = Array.from(new Set(rows.map((row) => row.country).filter(Boolean))).sort();
      return {
        ...representative,
        name: canonicalNameForSoda(representative),
        total_ratings: rows.reduce((sum, row) => sum + row.total_ratings, 0),
        variant_count: rows.length,
        variant_countries: countries
      };
    })
    .sort((a, b) => {
      if (b.variant_count !== a.variant_count) return b.variant_count - a.variant_count;
      return a.name.localeCompare(b.name);
    });
}
