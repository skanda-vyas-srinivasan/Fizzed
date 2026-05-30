import Link from "next/link";
import { ReviewCard } from "@/components/ReviewCard";
import { SodaCard } from "@/components/SodaCard";
import { getHomeData } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";

export default async function Home() {
  await ensureSodasSeeded();
  const { sodas, ratings, userCount } = await getHomeData();
  const totalRatings = sodas.reduce((sum, soda) => sum + soda.total_ratings, 0);

  return (
    <div className="space-y-8">
      <section className="relative grid min-h-[430px] overflow-hidden rounded-[2.25rem] bg-ink p-6 text-white shadow-soft ring-1 ring-black/10 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(216,66,58,0.45),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%)]" />
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-red-200">Letterboxd for sodas</p>
          <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.98] tracking-normal sm:text-7xl">
            Rate every soda worth remembering.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
            Track bottles, cans, fountain finds, regional classics, and imported curiosities in one quiet, fast place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/log" className="rounded-full bg-fizz px-5 py-3 text-sm font-bold text-white shadow-sm shadow-red-500/25">
              Log a soda
            </Link>
            <Link href="/browse" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-neutral-900">
              Browse database
            </Link>
          </div>
        </div>
        <div className="relative grid content-end gap-3">
          {["Cola", "Citrus", "Cherry", "Cream", "Ginger", "Root Beer", "Sparkling", "Imported"].map((tag) => (
            <Link
              key={tag}
              href={`/browse?category=${encodeURIComponent(tag)}`}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white/80 backdrop-blur transition hover:border-white/30 hover:bg-white/15 hover:text-white"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat value={sodas.length ? "5k+" : "Ready"} label="Real sodas after seed" />
        <Stat value={totalRatings.toLocaleString()} label="Ratings loaded" />
        <Stat value={userCount.toLocaleString()} label="Fizzed profiles" />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">Popular</p>
            <h2 className="font-display text-3xl font-black">Sodas people are reaching for</h2>
          </div>
          <Link href="/browse" className="text-sm font-bold text-fizz">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sodas.slice(0, 8).map((soda) => (
            <SodaCard key={soda.id} soda={soda} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">Feed</p>
          <h2 className="font-display text-3xl font-black">Recent activity</h2>
        </div>
        <div className="grid gap-4">
          {ratings.length ? (
            ratings.map((rating) => <ReviewCard key={rating.id} rating={rating} />)
          ) : (
            <div className="rounded-[1.6rem] bg-white p-8 text-neutral-500 ring-1 ring-black/5">
              No ratings yet. Seed the database, sign in, and make the first log.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.4rem] bg-white p-5 ring-1 ring-black/5">
      <div className="font-display text-3xl font-black text-ink">{value}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-500">{label}</div>
    </div>
  );
}
