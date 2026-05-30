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

const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const targetCount = targetArg ? Number(targetArg.split("=")[1]) : Infinity;
if (!Number.isFinite(targetCount) && targetCount !== Infinity) {
  throw new Error("Seed target must be a positive number, for example: npm run seed -- --target=10000");
}
if (targetCount !== Infinity && targetCount < 1) {
  throw new Error("Seed target must be a positive number, for example: npm run seed -- --target=10000");
}
const startPageArg = process.argv.find((arg) => arg.startsWith("--start-page="));
const startPage = Number(startPageArg?.split("=")[1] || 1);
if (!Number.isInteger(startPage) || startPage < 1) {
  throw new Error("Start page must be a positive integer, for example: npm run seed -- --target=10000 --start-page=50");
}

const tagMap = ["cola", "lemon", "lime", "orange", "ginger", "cream", "root-beer", "cherry", "grape", "tonic", "energy", "sparkling"];

function cleanTag(tag) {
  return tag.replace(/^en:/, "").replaceAll("-", " ");
}

function titleCase(value) {
  return value
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeProduct(product) {
  const name = product.product_name?.trim();
  if (!name || name.length < 2) return null;

  const brand = product.brands?.split(",")[0]?.trim() || "Unknown";
  const countryTag = product.countries_tags?.[0] || "en:unknown";
  const categories = product.categories_tags || [];
  const flavorTags = categories
    .map(cleanTag)
    .filter((tag) => tagMap.some((known) => tag.includes(known)))
    .map(titleCase)
    .filter(Boolean)
    .slice(0, 5);

  return {
    name: name.slice(0, 160),
    brand: brand.slice(0, 120),
    country: titleCase(cleanTag(countryTag)) || "Unknown",
    category: flavorTags[0] || "Soda",
    flavor_tags: Array.from(new Set(flavorTags.length ? flavorTags : ["Soda"])),
    image_url: product.image_front_url || null
  };
}

async function sodaCount() {
  const { count, error } = await supabase.from("sodas").select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

async function fetchPage(page) {
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("categories_tags", "sodas");
  url.searchParams.set("page_size", "100");
  url.searchParams.set("page", String(page));
  url.searchParams.set("fields", "product_name,brands,countries_tags,categories_tags,image_front_url");

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": "Fizzed/0.1 (local development soda rating app)" }
    });

    if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
      return response.json();
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }

  return null;
}

let count = await sodaCount();
console.log(`Starting soda count: ${count}`);
console.log(`Target soda count: ${targetCount === Infinity ? "all available pages" : targetCount}`);
console.log(`Starting Open Food Facts page: ${startPage}`);

let lastPage = 220;

for (let page = startPage; page <= lastPage && count < targetCount; page += 1) {
  const payload = await fetchPage(page);
  if (!payload?.products?.length) {
    console.log(`Page ${page}: skipped`);
    continue;
  }

  if (payload.count && payload.page_size) {
    lastPage = Math.ceil(payload.count / payload.page_size);
  }

  const rows = payload.products.map(normalizeProduct).filter(Boolean);
  if (!rows.length) continue;

  const { error } = await supabase.from("sodas").upsert(rows, {
    onConflict: "name,brand,country",
    ignoreDuplicates: true
  });

  if (error) throw new Error(error.message);

  count = await sodaCount();
  console.log(`Page ${page}: processed ${rows.length}, database count ${count}`);
}

console.log(`Finished soda count: ${count}`);
