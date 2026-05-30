import { notFound } from "next/navigation";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { RateDrinkPanel } from "@/components/RateDrinkPanel";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";
import { getCurrentUser, getCurrentUserRatingForSoda, getRatingBreakdown, getSoda, getSodaReviews } from "@/lib/data";
import type { Rating, Soda } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SodaPage({ params }: { params: { id: string } }) {
  noStore();

  const [soda, reviews, breakdown, user, currentRating] = await Promise.all([
    getSoda(params.id),
    getSodaReviews(params.id),
    getRatingBreakdown(params.id),
    getCurrentUser(),
    getCurrentUserRatingForSoda(params.id)
  ]);
  if (!soda) notFound();

  const tags = soda.flavor_tags.filter((tag) => tag && tag !== "Unknown");
  const subtitle = soda.brand === "Unknown" ? tags[0] || soda.category : soda.brand;
  const score = Number(soda.avg_rating || 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <p className="text-sm font-semibold text-[#CBBCC2]">{subtitle}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-4xl">{soda.name}</h1>
      </header>

      <section className="mt-5 grid gap-7 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="grid gap-5 md:grid-cols-[240px_1fr]">
            <SodaArtwork soda={soda} large />
            <div className="space-y-4">
              <div className="overflow-hidden rounded border border-white/10 bg-[#2B2228]">
                <ScorePanel score={score} note={`${soda.total_ratings.toLocaleString()} ratings`} />
              </div>

              <div id="details" className="rounded border border-white/10 bg-[#211A1F] p-4">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Details</h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">The Soda Wiki</span>
                </div>
                <Detail label="Brand" value={soda.brand} />
                <Detail label="Category" value={soda.category} />
                <Detail label="Origin" value={soda.country} />
                {tags.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/browse?q=${encodeURIComponent(tag)}`}
                        className="rounded bg-[#362B32] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#CBBCC2] hover:bg-[#4A3B43] hover:text-white"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <RateDrinkPanel sodaId={soda.id} isSignedIn={Boolean(user)} existingRating={currentRating} />
          </div>
        </div>

        <aside className="space-y-5">
          <div id="ratings" className="rounded border border-white/10 bg-[#2B2228] p-4">
            <h2 className="border-b border-white/10 pb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Rating breakdown</h2>
            <div className="mt-4">
              <RatingBreakdown rows={breakdown} />
            </div>
          </div>
        </aside>
      </section>

      <section id="reviews" className="mt-10">
        <SectionHeader title="User reviews" />
        <div className="mt-4">
          {reviews.length ? reviews.map((review) => <ReviewRow key={review.id} rating={{ ...review, sodas: soda }} />) : <EmptyReviews sodaId={soda.id} />}
        </div>
      </section>
    </div>
  );
}

function ScorePanel({ score, note }: { score: number; note: string }) {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-[104px_1fr]">
      <div>
        <div className="text-5xl font-extrabold leading-none text-white">{score.toFixed(1)}</div>
        <div className="mt-3 h-1 w-16 bg-[#A8E39C]" />
      </div>
      <div className="pt-1">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">User score</div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Stars value={score} size="text-3xl" />
          <span className="text-sm font-semibold text-[#CBBCC2]">{note}</span>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value || value === "Unknown") return null;

  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 border-b border-white/10 py-2 text-xs">
      <span className="font-extrabold uppercase tracking-[0.08em] text-[#8F8288]">{label}</span>
      <span className="font-semibold text-[#F8F1F3]">{value}</span>
    </div>
  );
}

function SectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/15 pb-2">
      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">{title}</h2>
      {href && action ? (
        <Link href={href} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function ReviewRow({ rating }: { rating: Rating }) {
  const profile = rating.profiles;

  return (
    <article className="grid grid-cols-[52px_1fr_auto] gap-4 border-b border-white/10 py-5">
      <div>
        <div className="text-2xl font-extrabold leading-none text-white">{rating.score === null ? "NR" : `${rating.score}.0`}</div>
        <div className="mt-2 h-1 w-10 bg-[#A8E39C]" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {profile?.username ? (
            <>
              <Link href={`/profile/${profile.username}`} className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-[10px] font-black text-[#4A3B43]">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username.slice(0, 2).toUpperCase()}
              </Link>
              <Link href={`/profile/${profile.username}`} className="text-sm font-extrabold text-white hover:text-[#D9A6B5]">
                @{profile.username}
              </Link>
            </>
          ) : (
            <span className="text-sm font-extrabold text-white">Fizzed user</span>
          )}
          <span className="text-xs font-semibold text-[#8F8288]">{new Date(rating.created_at).toLocaleDateString()}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#F8F1F3]">{rating.review_text}</p>
      </div>
      <div className="hidden pt-1 sm:block">
        <Stars value={rating.score} size="text-sm" />
      </div>
    </article>
  );
}

function EmptyReviews({ sodaId }: { sodaId: string }) {
  return (
    <div className="border-b border-white/10 py-6 text-sm font-medium text-[#CBBCC2]">
      No written reviews yet.{" "}
      <Link href={`/log?soda=${sodaId}`} className="font-bold text-[#D9A6B5] hover:text-white">
        Write the first one.
      </Link>
    </div>
  );
}
