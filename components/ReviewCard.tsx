import Link from "next/link";
import type { Rating } from "@/lib/types";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";

export function ReviewCard({ rating, showSoda = true }: { rating: Rating; showSoda?: boolean }) {
  const profile = rating.profiles;
  const soda = rating.sodas;

  return (
    <article className="rounded border border-white/10 bg-[#2B2228] p-4">
      <div className="flex gap-4">
        {showSoda && soda ? (
          <div className="w-16 shrink-0">
            <SodaArtwork soda={soda} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {soda ? (
                <Link href={`/soda/${soda.id}`} className="truncate text-base font-extrabold text-white hover:text-[#D9A6B5]">
                  {soda.name}
                </Link>
              ) : null}
              <div className="mt-0.5 flex items-center gap-2 text-sm text-[#CBBCC2]">
                {profile?.username ? (
                  <>
                    <Link href={`/profile/${profile.username}`} className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-[10px] font-black text-[#4A3B43]">
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username.slice(0, 2).toUpperCase()}
                    </Link>
                    <Link href={`/profile/${profile.username}`} className="font-bold text-[#F8F1F3] hover:text-[#D9A6B5]">
                      @{profile.username}
                    </Link>
                  </>
                ) : (
                  "Fizzed user"
                )}{" "}
                rated this {new Date(rating.created_at).toLocaleDateString()}
              </div>
            </div>
            <Stars value={rating.score} />
          </div>
          {rating.review_text ? <p className="mt-3 text-sm leading-6 text-[#F8F1F3]">{rating.review_text}</p> : null}
        </div>
      </div>
    </article>
  );
}
