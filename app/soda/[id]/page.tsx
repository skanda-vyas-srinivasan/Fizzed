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

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-black/5 md:grid-cols-[auto_1fr_320px] md:p-8">
        <SodaArtwork soda={soda} large />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">{soda.category}</p>
          <h1 className="mt-2 font-display text-5xl font-black leading-none">{soda.name}</h1>
          <p className="mt-3 text-neutral-500">
            {soda.brand} · {soda.country}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-display text-5xl font-black text-fizz">{Number(soda.avg_rating).toFixed(1)}</span>
            <Stars value={soda.avg_rating} size="text-xl" />
            <span className="text-sm font-semibold text-neutral-500">{soda.total_ratings} ratings</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {soda.flavor_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-cloud px-3 py-1.5 text-sm font-bold text-neutral-600">
                {tag}
              </span>
            ))}
          </div>
          <Link href={`/log?soda=${soda.id}`} className="mt-6 inline-flex rounded-full bg-fizz px-5 py-3 text-sm font-bold text-white">
            Log this soda
          </Link>
        </div>
        <div className="rounded-[1.4rem] bg-cloud p-5">
          <h2 className="mb-4 font-display text-2xl font-black">Rating breakdown</h2>
          <RatingBreakdown rows={breakdown} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">Reviews</p>
            <h2 className="font-display text-3xl font-black">What people think</h2>
          </div>
        </div>
        <div className="grid gap-4">
          {reviews.length ? reviews.map((review) => <ReviewCard key={review.id} rating={{ ...review, sodas: soda }} />) : <EmptyReviews sodaId={soda.id} />}
        </div>
      </section>
    </div>
  );
}

function EmptyReviews({ sodaId }: { sodaId: string }) {
  return (
    <div className="rounded-[1.6rem] bg-white p-8 text-neutral-500 ring-1 ring-black/5">
      No written reviews yet. <Link href={`/log?soda=${sodaId}`} className="font-bold text-fizz">Write the first one.</Link>
    </div>
  );
}
