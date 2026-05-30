import type { Soda } from "@/lib/types";

export function SodaArtwork({ soda, large = false }: { soda: Pick<Soda, "name" | "image_url" | "category">; large?: boolean }) {
  const size = large ? "aspect-[2/3] w-44 sm:w-56" : "aspect-[2/3] w-full";
  const imageSrc = soda.image_url ? `/api/image?url=${encodeURIComponent(soda.image_url)}` : null;

  return (
    <div className={`${size} overflow-hidden rounded border border-white/10 bg-[#202932] shadow-[0_10px_28px_rgba(0,0,0,0.36)]`}>
      {imageSrc ? (
        <img src={imageSrc} alt={soda.name} loading="lazy" decoding="async" className="h-full w-full object-contain p-3" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#26313b] to-[#14181c] text-6xl font-black text-[#9aa5b1]">
          {soda.category?.charAt(0) || "F"}
        </div>
      )}
    </div>
  );
}
