import Link from "next/link";
import type { Rating } from "@/lib/types";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";

export function ReviewCard({ rating, showSoda = true }: { rating: Rating; showSoda?: boolean }) {
  const profile = rating.profiles;
  const soda = rating.sodas;

  return (
    <article className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex gap-4">
        {showSoda && soda ? <SodaArtwork soda={soda} /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              {soda ? (
                <Link href={`/soda/${soda.id}`} className="truncate text-base font-bold text-ink hover:text-fizz">
                  {soda.name}
                </Link>
              ) : null}
              <div className="text-sm text-neutral-500">
                {profile?.username ? (
                  <Link href={`/profile/${profile.username}`} className="font-semibold text-neutral-700 hover:text-fizz">
                    @{profile.username}
                  </Link>
                ) : (
                  "Fizzed user"
                )}{" "}
                rated this {new Date(rating.created_at).toLocaleDateString()}
              </div>
            </div>
            <Stars value={rating.score} />
          </div>
          {rating.review_text ? <p className="mt-3 text-sm leading-6 text-neutral-700">{rating.review_text}</p> : null}
        </div>
      </div>
    </article>
  );
}
