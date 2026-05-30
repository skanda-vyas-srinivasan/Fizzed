import Link from "next/link";
import type { GroupedSoda } from "@/lib/normalize";
import type { Soda } from "@/lib/types";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";

export function SodaCard({ soda }: { soda: Soda | GroupedSoda }) {
  const variantCount = "variant_count" in soda ? soda.variant_count : 1;
  const flavorTags = soda.flavor_tags.filter((tag) => tag && tag !== "Unknown").slice(0, 3);
  const countryLabel =
    "variant_countries" in soda && soda.variant_countries.length > 1
      ? `${soda.variant_countries.slice(0, 2).join(", ")}${soda.variant_countries.length > 2 ? ` +${soda.variant_countries.length - 2}` : ""}`
      : soda.country;
  const subtitle =
    soda.country === "Global"
      ? soda.brand === "Unknown"
        ? flavorTags[0] || soda.category
        : soda.brand
      : `${soda.brand} · ${countryLabel}`;

  return (
    <Link href={`/soda/${soda.id}`} className="group flex gap-4 rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <SodaArtwork soda={soda} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold text-ink">{soda.name}</div>
        <div className="mt-1 truncate text-sm text-neutral-500">{subtitle}</div>
        <div className="mt-3 flex items-center gap-2">
          <Stars value={soda.avg_rating} />
          <span className="text-sm font-semibold text-neutral-600">{Number(soda.avg_rating).toFixed(1)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {variantCount > 1 ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-fizz">
              {variantCount} variants
            </span>
          ) : null}
          {flavorTags.map((tag) => (
            <span key={tag} className="rounded-full bg-cloud px-2.5 py-1 text-xs font-semibold text-neutral-500">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
