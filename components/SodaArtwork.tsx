import type { Soda } from "@/lib/types";

export function SodaArtwork({ soda, large = false }: { soda: Pick<Soda, "name" | "image_url" | "category">; large?: boolean }) {
  const size = large ? "h-36 w-28" : "h-20 w-16";
  const imageSrc = soda.image_url ? `/api/image?url=${encodeURIComponent(soda.image_url)}` : null;

  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-[1.4rem] bg-white shadow-soft ring-1 ring-black/10`}>
      {imageSrc ? (
        <img src={imageSrc} alt={soda.name} loading="lazy" decoding="async" className="h-full w-full object-contain p-2" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-red-50 via-white to-neutral-100 font-display text-4xl font-black text-fizz">
          {soda.category?.charAt(0) || "F"}
        </div>
      )}
    </div>
  );
}
