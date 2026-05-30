import Link from "next/link";
import type { GroupedSoda } from "@/lib/normalize";
import type { Soda } from "@/lib/types";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";

export function SodaCard({ soda }: { soda: Soda | GroupedSoda }) {
  const variantCount = "variant_count" in soda ? soda.variant_count : 1;

  return (
    <Link href={`/soda/${soda.id}`} className="group block">
      <div className="transition duration-150 group-hover:-translate-y-1 group-hover:shadow-[0_0_0_2px_#E58A84,0_10px_22px_rgba(24,18,21,0.28)]">
        <SodaArtwork soda={soda} />
      </div>
      <div className="mt-2 min-w-0">
        <div className="truncate text-sm font-bold leading-5 text-[#F8F1F3] group-hover:text-white">{soda.name}</div>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars value={soda.avg_rating} size="text-xs" />
          <span className="text-xs font-bold text-[#CBBCC2]">{Number(soda.avg_rating).toFixed(1)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {variantCount > 1 ? <span className="rounded bg-[#4A3B43] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#CBBCC2]">{variantCount}</span> : null}
        </div>
      </div>
    </Link>
  );
}
