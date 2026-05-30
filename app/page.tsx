import Link from "next/link";
import { ReviewCard } from "@/components/ReviewCard";
import { SodaCard } from "@/components/SodaCard";
import { getHomeData } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";

export default async function Home() {
  await ensureSodasSeeded();
  const { sodas, ratings, userCount, sodaCount } = await getHomeData();
  const totalRatings = sodas.reduce((sum, soda) => sum + soda.total_ratings, 0);

  return (
    <div className="space-y-10">
      <section className="border-b border-white/10 pb-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E8C879]">Letterboxd for sodas</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl">
              Track every can, bottle, and fountain pull.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#CBBCC2]">
              Rate sodas, keep a diary, and browse a cleaner catalog built from The Soda Wiki.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/browse" className="rounded bg-[#E58A84] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">
                Browse
              </Link>
              <Link href="/log" className="rounded bg-[#4A3B43] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3]">
                Log a soda
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded border border-white/10 bg-[#2B2228] p-4">
            <Stat value={sodaCount.toLocaleString()} label="Sodas" />
            <Stat value={totalRatings.toLocaleString()} label="Ratings" />
            <Stat value={userCount.toLocaleString()} label="Members" />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Featured" title="Start with these sodas" href="/browse" />
        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {sodas.slice(0, 8).map((soda) => (
            <SodaCard key={soda.id} soda={soda} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Feed" title="Recent activity" />
        <div className="mt-4 grid gap-3">
          {ratings.length ? (
            ratings.map((rating) => <ReviewCard key={rating.id} rating={rating} />)
          ) : (
            <div className="rounded border border-white/10 bg-[#2B2228] p-6 text-sm font-medium text-[#CBBCC2]">
              No ratings yet. Seed the database, sign in, and make the first log.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between border-b border-white/10 pb-2">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#CBBCC2]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-extrabold text-white">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#D9A6B5] hover:text-white">
          More
        </Link>
      ) : null}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#CBBCC2]">{label}</div>
    </div>
  );
}
