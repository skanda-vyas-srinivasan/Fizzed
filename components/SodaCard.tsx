import Link from "next/link";
import type { GroupedSoda } from "@/lib/normalize";
import type { Soda } from "@/lib/types";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";

export function SodaCard({ soda }: { soda: Soda | GroupedSoda }) {
  const variantCount = "variant_count" in soda ? soda.variant_count : 1;
  const flavorTags = soda.flavor_tags.filter((tag) => tag && tag !== "Unknown").slice(0, 2);
  const subtitle = soda.brand === "Unknown" ? flavorTags[0] || soda.category : soda.brand;

  return (
    <Link href={`/soda/${soda.id}`} className="group block">
      <div className="transition duration-150 group-hover:-translate-y-1 group-hover:shadow-[0_0_0_3px_#00c030,0_18px_38px_rgba(0,0,0,0.45)]">
        <SodaArtwork soda={soda} />
      </div>
      <div className="mt-2 min-w-0">
        <div className="truncate text-sm font-bold leading-5 text-[#d8e0e8] group-hover:text-white">{soda.name}</div>
        <div className="truncate text-xs font-semibold text-[#9aa5b1]">{subtitle}</div>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars value={soda.avg_rating} size="text-xs" />
          <span className="text-xs font-bold text-[#9aa5b1]">{Number(soda.avg_rating).toFixed(1)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {variantCount > 1 ? <span className="rounded bg-[#2c3440] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#9aa5b1]">{variantCount}</span> : null}
          {flavorTags.map((tag) => (
            <span key={tag} className="rounded bg-[#202932] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9aa5b1]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
