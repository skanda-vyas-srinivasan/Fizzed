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
const wikiApi = "https://mountaindew.fandom.com/api.php";
const catalogCountry = "Global";
const excludedTitles = new Set(["Amp Energy", "Generic Flavors", "Pepsi Spire and Fusion Flavors"]);

function displayName(title) {
  if (/^hard\b/i.test(title)) return null;
  if (/^mountain dew\b/i.test(title)) return title;
  if (/^diet mountain dew\b/i.test(title)) return title;
  if (/^dirty mountain dew\b/i.test(title)) return title;
  if (/^caffeine-free diet mountain dew\b/i.test(title)) return title;
  if (/^kickstart\b/i.test(title)) return `Mountain Dew ${title}`;
  if (/^jumpstart\b/i.test(title)) return `Mountain Dew ${title}`;
  return `Mountain Dew ${title}`;
}

function titleCase(value) {
  return value
    .replace(/[()]/g, " ")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => {
      if (part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function tagsFromTitle(title) {
  return title
    .replace(/^Mountain Dew\s*/i, "")
    .replace(/^Diet Mountain Dew\s*/i, "Diet")
    .replace(/^Caffeine-Free Diet Mountain Dew\s*/i, "Diet")
    .replace(/^Kickstart\s*/i, "")
    .replace(/^Jumpstart\s*/i, "")
    .split(/[,/&+]+|\band\b|-/i)
    .map((part) => titleCase(part.trim()))
    .filter(Boolean)
    .filter((tag) => !/^(Mountain|Dew|Flavor|Energizing|Energised)$/i.test(tag))
    .slice(0, 5);
}

async function fetchCategoryMembers() {
  const pages = [];
  let cmcontinue;

  do {
    const url = new URL(wikiApi);
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "categorymembers");
    url.searchParams.set("cmtitle", "Category:Current Flavors");
    url.searchParams.set("cmlimit", "100");
    url.searchParams.set("format", "json");
    if (cmcontinue) url.searchParams.set("cmcontinue", cmcontinue);

    const response = await fetch(url);
    const payload = await response.json();
    pages.push(...payload.query.categorymembers.filter((page) => page.ns === 0));
    cmcontinue = payload.continue?.cmcontinue;
  } while (cmcontinue);

  return pages.filter((page) => !excludedTitles.has(page.title));
}

async function fetchPageDetails(titles) {
  const url = new URL(wikiApi);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", titles.join("|"));
  url.searchParams.set("prop", "pageimages|revisions|images");
  url.searchParams.set("piprop", "original|thumbnail");
  url.searchParams.set("pithumbsize", "500");
  url.searchParams.set("rvprop", "content");
  url.searchParams.set("rvslots", "main");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  const payload = await response.json();
  const pages = Object.values(payload.query.pages).filter((page) => page.pageid);
  await attachFallbackImages(pages);
  return pages;
}

function fallbackFileTitle(page) {
  const imageTitle = page.images?.find((image) => /\.(png|jpe?g|webp|gif)$/i.test(image.title))?.title;
  if (imageTitle) return imageTitle;

  const revision = page.revisions?.[0]?.slots?.main?.["*"] || "";
  const match = revision.match(/File:[^}|\]\n]+\.(?:png|jpe?g|webp|gif)/i);
  return match?.[0];
}

async function attachFallbackImages(pages) {
  const fileTitles = Array.from(new Set(pages.filter((page) => !page.original?.source && !page.thumbnail?.source).map(fallbackFileTitle).filter(Boolean)));
  if (!fileTitles.length) return;

  for (let index = 0; index < fileTitles.length; index += 50) {
    const batch = fileTitles.slice(index, index + 50);
    const url = new URL(wikiApi);
    url.searchParams.set("action", "query");
    url.searchParams.set("titles", batch.join("|"));
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url");
    url.searchParams.set("format", "json");

    const response = await fetch(url);
    const payload = await response.json();
    const urlsByTitle = new Map(
      Object.values(payload.query.pages)
        .filter((page) => page.title && page.imageinfo?.[0]?.url)
        .map((page) => [page.title, page.imageinfo[0].url])
    );

    for (const page of pages) {
      const fileTitle = fallbackFileTitle(page);
      if (fileTitle && urlsByTitle.has(fileTitle)) page.fallbackImageUrl = urlsByTitle.get(fileTitle);
    }
  }
}

function imageUrl(page) {
  return page.original?.source || page.thumbnail?.source || page.fallbackImageUrl || null;
}

function toRow(page) {
  const name = displayName(page.title);
  if (!name) return null;
  const tags = tagsFromTitle(name);

  return {
    name: name.slice(0, 160),
    brand: "Mountain Dew",
    country: catalogCountry,
    category: tags[0] || "Citrus",
    flavor_tags: tags.length ? tags : ["Citrus"],
    image_url: imageUrl(page)
  };
}

function updateLocalIndex(rows) {
  const indexPath = "lib/wiki-soda-names.json";
  const names = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const merged = Array.from(new Set([...names, ...rows.map((row) => row.name)])).sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(indexPath, `${JSON.stringify(merged, null, 2)}\n`);
}

const members = await fetchCategoryMembers();
const pages = [];

for (let index = 0; index < members.length; index += 50) {
  pages.push(...(await fetchPageDetails(members.slice(index, index + 50).map((page) => page.title))));
}

const rows = pages.map(toRow).filter(Boolean);
updateLocalIndex(rows);

if (dryRun) {
  console.log(JSON.stringify(rows.map((row) => ({ name: row.name, image_url: row.image_url })).slice(0, 80), null, 2));
  console.log(`Dry run complete. Prepared ${rows.length} Mountain Dew rows and updated lib/wiki-soda-names.json locally.`);
} else {
  const { error } = await supabase.from("sodas").upsert(rows, {
    onConflict: "name,brand,country",
    ignoreDuplicates: false
  });

  if (error) throw new Error(error.message);
  console.log(`Imported ${rows.length} Mountain Dew current flavors`);
}
