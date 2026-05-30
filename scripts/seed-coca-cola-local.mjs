import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const htmlPath = "/Users/skandavyassrinivasan/Downloads/All Coca-Cola Flavors – Brandon Olmedo.html";
const assetDir = "/Users/skandavyassrinivasan/Downloads/All Coca-Cola Flavors – Brandon Olmedo_files";
const publicDir = "public/catalog/coca-cola";
const dryRun = process.argv.includes("--dry-run");

const excludedNamePatterns = [
  /born on may/i,
  /chewing gum/i,
  /tic tac/i,
  /jack\s*&\s*coke/i,
  /tennessee whiskey/i,
  /bl\s*ā\s*k intense corset/i
];

function readEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function decode(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;|&#038;/g, "&")
    .replace(/&quot;|&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value) {
  return decode(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeName(value) {
  return value
    .replace(/^\d+\.?\s*/, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayName(value) {
  const first = normalizeName(value).split(" / ")[0].trim();
  return first
    .replace(/^Coca-Cola With /i, "Coca-Cola ")
    .replace(/^Diet Coke with /i, "Diet Coke ")
    .replace(/^Coca-Cola Black$/i, "Coca-Cola Blak")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalName(value) {
  return displayName(value)
    .toLowerCase()
    .replace(/^(the\s+)?coca cola\b/, "coca-cola")
    .replace(/^coke\b/, "coca-cola")
    .replace(/\bwith\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryFor(name) {
  const lower = name.toLowerCase();
  if (lower.includes("cherry")) return "Cherry";
  if (lower.includes("vanilla")) return "Vanilla";
  if (lower.includes("orange")) return "Orange";
  if (lower.includes("lime")) return "Lime";
  if (lower.includes("lemon")) return "Lemon";
  if (lower.includes("raspberry")) return "Raspberry";
  if (lower.includes("ginger")) return "Ginger";
  if (lower.includes("coffee")) return "Coffee";
  if (lower.includes("cinnamon")) return "Cinnamon";
  if (lower.includes("zero") || lower.includes("diet") || lower.includes("light")) return "Zero Sugar";
  return "Cola";
}

function parseRows() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const articleStart = html.indexOf("<article");
  const article = articleStart >= 0 ? html.slice(articleStart) : html;
  const tokenRe =
    /<p[^>]*>[\s\S]*?<\/p>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<div class="wp-block-jetpack-slideshow[\s\S]*?<\/div><\/div>|<figure[^>]*>[\s\S]*?<\/figure>/gi;

  let pendingName = null;
  const rows = [];

  for (const match of article.matchAll(tokenRe)) {
    const token = match[0];
    const text = stripHtml(token);
    const isHeading = /<strong[\s\S]*?<\/strong>/i.test(token);
    const images = [...token.matchAll(/<img\b[^>]*\bsrc="\.\/All Coca-Cola Flavors – Brandon Olmedo_files\/([^"]+)"/gi)].map((image) => image[1]);

    if (images.length && pendingName) {
      rows.push({ sourceName: pendingName, image: images[0] });
      pendingName = null;
      continue;
    }

    if (!text || text.length > 140) continue;
    if (!isHeading && !/^(Coca|Coke|Diet Coke|Tab\b|Frozen Coke|Frozen Coca-Cola|FROZONE)/i.test(text)) continue;
    if (!/(Coca|Coke|Diet Coke|Tab\b|Frozen Coke|Frozen Coca-Cola|FROZONE)/i.test(text)) continue;
    pendingName = normalizeName(text);
  }

  const seen = new Set();
  return rows
    .map((row) => ({ ...row, name: displayName(row.sourceName), canonical: canonicalName(row.sourceName) }))
    .filter((row) => row.name && !excludedNamePatterns.some((pattern) => pattern.test(row.name)))
    .filter((row) => {
      if (seen.has(row.canonical)) return false;
      seen.add(row.canonical);
      return true;
    });
}

function copyImages(rows) {
  fs.mkdirSync(publicDir, { recursive: true });

  return rows.map((row) => {
    const extension = path.extname(row.image).toLowerCase() || ".jpg";
    const filename = `${slugify(row.name)}${extension}`;
    const source = path.join(assetDir, row.image);
    const destination = path.join(publicDir, filename);

    if (!fs.existsSync(source)) throw new Error(`Missing source image: ${source}`);
    fs.copyFileSync(source, destination);

    return {
      name: row.name.slice(0, 160),
      brand: "Coca-Cola",
      country: "Global",
      category: categoryFor(row.name),
      flavor_tags: [],
      image_url: `/catalog/coca-cola/${filename}`
    };
  });
}

function updateLocalIndex(rows) {
  const indexPath = "lib/wiki-soda-names.json";
  const names = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const merged = Array.from(new Set([...names, ...rows.map((row) => row.name)])).sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(indexPath, `${JSON.stringify(merged, null, 2)}\n`);
}

const parsed = parseRows();
const rows = dryRun
  ? parsed.map((row) => ({
      name: row.name,
      brand: "Coca-Cola",
      country: "Global",
      category: categoryFor(row.name),
      flavor_tags: [],
      image_url: `/catalog/coca-cola/${slugify(row.name)}${path.extname(row.image).toLowerCase() || ".jpg"}`
    }))
  : copyImages(parsed);

if (dryRun) {
  console.log(JSON.stringify(rows, null, 2));
  console.log(`Dry run complete. Prepared ${rows.length} Coca-Cola rows.`);
} else {
  updateLocalIndex(rows);
  const env = readEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { error } = await supabase.from("sodas").upsert(rows, {
    onConflict: "name,brand,country",
    ignoreDuplicates: false
  });

  if (error) throw new Error(error.message);
  console.log(`Imported ${rows.length} Coca-Cola rows`);
}
