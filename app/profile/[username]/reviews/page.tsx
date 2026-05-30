import { notFound } from "next/navigation";
import Link from "next/link";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";
import { getProfile, getProfileRatings } from "@/lib/data";
import type { Rating } from "@/lib/types";

export default async function ProfileReviewsPage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const ratings = await getProfileRatings(profile.id, 1000);
  const reviews = ratings.filter((rating) => rating.review_text?.trim());

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="border-b border-white/10 pb-4">
        <Link href={`/profile/${profile.username}`} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          Back to profile
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-white">@{profile.username} reviews</h1>
      </header>

      <section>
        {reviews.length ? reviews.map((rating) => <ReviewRow key={rating.id} rating={rating} />) : <div className="border-b border-white/10 py-6 text-sm font-semibold text-[#CBBCC2]">No written reviews yet.</div>}
      </section>
    </div>
  );
}

function ReviewRow({ rating }: { rating: Rating }) {
  const soda = rating.sodas;
  if (!soda) return null;

  return (
    <article className="grid grid-cols-[64px_1fr] gap-4 border-b border-white/10 py-4">
      <Link href={`/soda/${soda.id}`} className="block">
        <SodaArtwork soda={soda} />
      </Link>
      <div>
        <Link href={`/soda/${soda.id}`} className="text-sm font-extrabold text-white hover:text-[#D9A6B5]">
          {soda.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#E8C879]">{rating.score === null ? "NR" : `${rating.score}.0`}</span>
          {rating.score === null ? null : <Stars value={rating.score} size="text-xs" />}
          <span className="text-xs font-semibold text-[#8F8288]">{new Date(rating.created_at).toLocaleDateString()}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#F8F1F3]">{rating.review_text}</p>
      </div>
    </article>
  );
}
