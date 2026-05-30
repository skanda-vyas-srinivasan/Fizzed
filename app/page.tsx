import Link from "next/link";
import { SodaCard } from "@/components/SodaCard";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";
import { getHomeData, getTopSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";
import type { Rating, Soda } from "@/lib/types";

export default async function Home() {
  await ensureSodasSeeded();
  const [{ sodas, ratings }, topSodas] = await Promise.all([getHomeData(), getTopSodas(5)]);
  const randomSodas = sodas.slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section>
        <SectionHeader title="Check these out" />
        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
          {randomSodas.map((soda) => (
            <SodaCard key={soda.id} soda={soda} />
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <SectionHeader title="Recent reviews" />
          <div className="mt-4 grid gap-x-5 gap-y-7 sm:grid-cols-2">
            {ratings.length ? (
              ratings.slice(0, 3).map((rating) => <ReviewTile key={rating.id} rating={rating} />)
            ) : (
              <EmptyPanel />
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <RankList title="Top sodas" sodas={topSodas} href="/top" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between border-b border-white/10 pb-2">
      <h1 className="text-2xl font-extrabold text-white">{title}</h1>
      {href ? (
        <Link href={href} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          View all
        </Link>
      ) : null}
    </div>
  );
}

function ReviewTile({ rating }: { rating: Rating }) {
  const soda = rating.sodas;
  const profile = rating.profiles;

  if (!soda) return null;

  return (
    <article className="border-b border-white/10 pb-5">
      <div className="flex gap-4">
        <Link href={`/soda/${soda.id}`} className="w-20 shrink-0">
          <SodaArtwork soda={soda} />
        </Link>
        <div className="min-w-0">
          <Link href={`/soda/${soda.id}`} className="line-clamp-1 text-sm font-extrabold text-white hover:text-[#D9A6B5]">
            {soda.name}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#CBBCC2]">
            {profile?.username ? (
              <>
                <Link href={`/profile/${profile.username}`} className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-[9px] font-black text-[#4A3B43]">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username.slice(0, 2).toUpperCase()}
                </Link>
                <Link href={`/profile/${profile.username}`} className="text-[#F8F1F3] hover:text-[#D9A6B5]">
                  @{profile.username}
                </Link>
              </>
            ) : (
              "Fizzed user"
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-bold text-[#CBBCC2]">{rating.score === null ? "NR" : `${rating.score}.0`}</span>
            {rating.score === null ? null : <Stars value={rating.score} size="text-xs" />}
          </div>
          <p className="mt-3 line-clamp-4 text-xs leading-5 text-[#CBBCC2]">{rating.review_text}</p>
        </div>
      </div>
    </article>
  );
}

function RankList({ title, sodas, href }: { title: string; sodas: Soda[]; href?: string }) {
  return (
    <div>
      <SectionHeader title={title} href={href} />
      <div className="mt-4 space-y-3">
        {sodas.map((soda, index) => (
          <Link key={soda.id} href={`/soda/${soda.id}`} className="grid grid-cols-[2.25rem_5.25rem_1fr] items-center gap-4 border-b border-white/10 pb-4">
            <div className="text-3xl font-extrabold leading-none text-[#E8C879]">{index + 1}</div>
            <div className="w-[5.25rem] shrink-0">
              <SodaArtwork soda={soda} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-lg font-extrabold leading-6 text-white">{soda.name}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-2xl font-extrabold leading-none text-[#E8C879]">{Number(soda.avg_rating || 0).toFixed(1)}</div>
                <Stars value={soda.avg_rating} size="text-sm" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="rounded border border-white/10 bg-[#2B2228] p-6 text-sm font-medium text-[#CBBCC2] sm:col-span-2">
      No ratings yet. Sign in and make the first log.
    </div>
  );
}
