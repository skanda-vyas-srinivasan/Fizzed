import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = Number(limitArg?.split("=")[1] || 250);
const wikiApi = "https://soda-loverswiki.fandom.com/api.php";
const source = "soda_lovers_wiki";
const knownCountries = new Set([
  "Australia",
  "Brazil",
  "Canada",
  "China",
  "France",
  "Germany",
  "India",
  "Japan",
  "Lebanon",
  "Mexico",
  "Turkey",
  "United Kingdom",
  "United States"
]);
const nonFlavorCategories = [
  /the flavors/i,
  /^(red|blue|green|yellow|purple|brown|clear|beige|pink|orange|black|white)$/,
  /\b(can|bottle|glass|online|rare|knockoffs?|discontinued|available|soda water)\b/i,
  /^(red|blue|green|yellow|purple|brown|clear|beige|pink|orange|black|white) flavors?$/i,
  /^\d{3,4}s?\??$/,
  /^\d+(\.\d+)?\s?(ml|l|oz)$/i
];
const nonFlavorTags = new Set(["Red", "Blue", "Green", "Yellow", "Purple", "Brown", "Clear", "Beige", "Pink", "Orange", "Black", "White"]);

function titleCase(value) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => {
      if (part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function normalizeInfoboxKey(key) {
  return key.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseInfobox(wikitext) {
  const match = wikitext.match(/\{\{Soda[_ ]Infobox\|([\s\S]*?)\n\}\}/i) || wikitext.match(/\{\{Soda[_ ]Template\|([\s\S]*?)\n\}\}/i);
  if (!match) return {};

  return Object.fromEntries(
    match[1]
      .split(/\n\|/)
      .map((line) => line.replace(/^\|/, "").trim())
      .map((line) => {
        const index = line.indexOf("=");
        if (index === -1) return null;
        return [normalizeInfoboxKey(line.slice(0, index)), line.slice(index + 1).replace(/\[\[|\]\]/g, "").trim()];
      })
      .filter(Boolean)
  );
}

function parseCategories(wikitext) {
  return Array.from(wikitext.matchAll(/\[\[Category:([^\]]+)\]\]/g))
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function flavorTagsFrom(infobox, categories) {
  const tags = new Set();
  const type = infobox.type || infobox.flavor || infobox.flavor_;

  if (type) {
    type
      .split(/[,/]+|\band\b/i)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => tags.add(titleCase(part)));
  }

  for (const category of categories) {
    if (nonFlavorCategories.some((pattern) => pattern.test(category))) continue;
    if (/flavors?$/i.test(category)) {
      tags.add(titleCase(category.replace(/flavors?$/i, "").trim()));
    }
  }

  return Array.from(tags)
    .filter((tag) => tag && tag !== "The")
    .filter((tag) => !nonFlavorTags.has(tag))
    .filter((tag) => !/^\d+(\.\d+)?\s?(ml|l|oz)$/i.test(tag))
    .slice(0, 6);
}

function brandFromTitle(title) {
  const known = ["Coca-Cola", "Pepsi", "Mountain Dew", "Sprite", "Fanta", "7 Up", "7up", "Dr Pepper", "Crush", "Faygo", "Jones", "Jarritos", "Shasta", "Sunkist"];
  const match = known.find((brand) => title.toLowerCase().startsWith(brand.toLowerCase()));
  return match || "Unknown";
}

function countryFrom(infobox, categories) {
  const country = infobox.country_of_origine || infobox.country_of_origin || infobox.locations_available;
  if (country) return titleCase(country.replace(/<[^>]+>/g, ""));

  const candidate = categories.find((category) => knownCountries.has(category));
  return candidate ? titleCase(candidate) : "Unknown";
}

function imageUrl(page) {
  return page.original?.source || null;
}

function toRow(page) {
  const revision = page.revisions?.[0]?.slots?.main?.["*"] || "";
  const infobox = parseInfobox(revision);
  const categories = parseCategories(revision);
  const tags = flavorTagsFrom(infobox, categories);
  const type = tags[0] || infobox.type || infobox.flavor || "Soda";

  return {
    name: (infobox.title1 || page.title).slice(0, 160),
    brand: brandFromTitle(page.title).slice(0, 120),
    country: countryFrom(infobox, categories),
    category: titleCase(type).slice(0, 120),
    flavor_tags: tags.length ? tags : ["Soda"],
    image_url: imageUrl(page)
  };
}

function toReviewRow(page) {
  const revision = page.revisions?.[0]?.slots?.main?.["*"] || "";
  const infobox = parseInfobox(revision);
  const categories = parseCategories(revision);

  return {
    ...toRow(page),
    source,
    source_url: `https://soda-loverswiki.fandom.com/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`,
    source_page_id: String(page.pageid),
    source_payload: {
      title: page.title,
      infobox,
      categories
    }
  };
}

async function fetchCategoryMembers() {
  const pages = [];
  let cmcontinue;

  while (pages.length < limit) {
    const url = new URL(wikiApi);
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "categorymembers");
    url.searchParams.set("cmtitle", "Category:The flavors");
    url.searchParams.set("cmlimit", "500");
    url.searchParams.set("format", "json");
    if (cmcontinue) url.searchParams.set("cmcontinue", cmcontinue);

    const response = await fetch(url);
    const payload = await response.json();
    pages.push(...payload.query.categorymembers.filter((page) => page.ns === 0));
    cmcontinue = payload.continue?.cmcontinue;
    if (!cmcontinue) break;
  }

  return pages.slice(0, limit);
}

async function fetchPageDetails(titles) {
  const url = new URL(wikiApi);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", titles.join("|"));
  url.searchParams.set("prop", "pageimages|revisions");
  url.searchParams.set("piprop", "original");
  url.searchParams.set("rvprop", "content");
  url.searchParams.set("rvslots", "main");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  const payload = await response.json();
  return Object.values(payload.query.pages).filter((page) => page.pageid);
}

const members = await fetchCategoryMembers();
console.log(`Found ${members.length} wiki flavor pages`);

let imported = 0;
let previewed = 0;

for (let index = 0; index < members.length; index += 50) {
  const batch = members.slice(index, index + 50);
  const pages = await fetchPageDetails(batch.map((page) => page.title));
  const rows = pages.map(toRow);

  if (dryRun) {
    for (const row of pages.map(toReviewRow).slice(0, Math.max(0, 20 - previewed))) {
      console.log(JSON.stringify({ name: row.name, brand: row.brand, country: row.country, category: row.category, flavor_tags: row.flavor_tags, image_url: row.image_url }, null, 2));
      previewed += 1;
    }
    continue;
  }

  const { error } = await supabase.from("sodas").upsert(rows, {
    onConflict: "name,brand,country",
    ignoreDuplicates: false
  });

  if (error) throw new Error(error.message);
  imported += rows.length;
  console.log(`Imported ${imported}/${members.length}`);
}

if (dryRun) {
  console.log("Dry run complete. No rows were written.");
} else {
  console.log(`Imported ${imported} wiki sodas`);
}
