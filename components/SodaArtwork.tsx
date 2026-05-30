import type { Soda } from "@/lib/types";

export function SodaArtwork({ soda, large = false }: { soda: Pick<Soda, "name" | "image_url" | "category">; large?: boolean }) {
  const size = large ? "h-36 w-28" : "h-20 w-16";

  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-[1.4rem] bg-white shadow-soft ring-1 ring-black/10`}>
      {soda.image_url ? (
        <img src={soda.image_url} alt={soda.name} referrerPolicy="no-referrer" className="h-full w-full object-contain p-2" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-red-50 via-white to-neutral-100 font-display text-4xl font-black text-fizz">
          {soda.category?.charAt(0) || "F"}
        </div>
      )}
    </div>
  );
}
