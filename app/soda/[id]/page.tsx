import { notFound } from "next/navigation";
import Link from "next/link";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { ReviewCard } from "@/components/ReviewCard";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";
import { getRatingBreakdown, getSoda, getSodaReviews } from "@/lib/data";

export default async function SodaPage({ params }: { params: { id: string } }) {
  const [soda, reviews, breakdown] = await Promise.all([getSoda(params.id), getSodaReviews(params.id), getRatingBreakdown(params.id)]);
  if (!soda) notFound();

  const tags = soda.flavor_tags.filter((tag) => tag && tag !== "Unknown");
  const subtitle = soda.brand === "Unknown" ? tags[0] || soda.category : soda.brand;

  return (
    <div className="space-y-8">
      <section className="grid gap-7 border-b border-white/10 pb-8 md:grid-cols-[auto_1fr_320px]">
        <SodaArtwork soda={soda} large />
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff8000]">{soda.category}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-none tracking-tight text-white sm:text-6xl">{soda.name}</h1>
          <p className="mt-3 text-lg font-semibold text-[#9aa5b1]">{subtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-5xl font-extrabold text-white">{Number(soda.avg_rating).toFixed(1)}</span>
            <Stars value={soda.avg_rating} size="text-xl" />
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#9aa5b1]">{soda.total_ratings} ratings</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-[#202932] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-[#9aa5b1]">
                {tag}
              </span>
            ))}
          </div>
          <Link href={`/log?soda=${soda.id}`} className="mt-7 inline-flex rounded bg-[#00c030] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#071009]">
            Log this soda
          </Link>
        </div>
        <div className="h-fit rounded border border-white/10 bg-[#1b2229] p-5">
          <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.12em] text-white">Rating breakdown</h2>
          <RatingBreakdown rows={breakdown} />
        </div>
      </section>

      <section>
        <div className="mb-4 border-b border-white/10 pb-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa5b1]">Reviews</p>
          <h2 className="mt-1 text-xl font-extrabold text-white">What people think</h2>
        </div>
        <div className="grid gap-3">
          {reviews.length ? reviews.map((review) => <ReviewCard key={review.id} rating={{ ...review, sodas: soda }} />) : <EmptyReviews sodaId={soda.id} />}
        </div>
      </section>
    </div>
  );
}

function EmptyReviews({ sodaId }: { sodaId: string }) {
  return (
    <div className="rounded border border-white/10 bg-[#1b2229] p-6 text-sm font-medium text-[#9aa5b1]">
      No written reviews yet.{" "}
      <Link href={`/log?soda=${sodaId}`} className="font-bold text-[#40bcf4] hover:text-white">
        Write the first one.
      </Link>
    </div>
  );
}
