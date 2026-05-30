import Link from "next/link";
import { SodaCard } from "@/components/SodaCard";
import { getBrowseFacets, getSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";

export default async function Browse({ searchParams }: { searchParams: { q?: string; brand?: string; country?: string; category?: string } }) {
  await ensureSodasSeeded();
  const [sodas, facets] = await Promise.all([getSodas(searchParams), getBrowseFacets()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">Browse</p>
          <h1 className="font-display text-5xl font-black">The soda shelf</h1>
        </div>
        <form className="flex w-full gap-2 sm:w-auto">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search soda or brand"
            className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-fizz sm:w-72"
          />
          <button className="rounded-full bg-fizz px-5 py-3 text-sm font-bold text-white">Search</button>
        </form>
      </div>

      <div className="grid gap-3 rounded-[1.6rem] bg-white p-4 ring-1 ring-black/5 md:grid-cols-3">
        <Facet name="category" value={searchParams.category} items={facets.categories} label="Category" />
        <Facet name="country" value={searchParams.country} items={facets.countries} label="Country" />
        <Facet name="brand" value={searchParams.brand} items={facets.brands} label="Brand" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-500">{sodas.length} results</p>
        <Link href="/browse" className="text-sm font-bold text-fizz">
          Clear filters
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sodas.map((soda) => (
          <SodaCard key={soda.id} soda={soda} />
        ))}
      </div>
    </div>
  );
}

function Facet({ name, value, items, label }: { name: string; value?: string; items: string[]; label: string }) {
  return (
    <form>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">{label}</label>
      <select
        name={name}
        defaultValue={value || ""}
        className="w-full rounded-2xl border border-black/10 bg-cloud px-3 py-3 text-sm font-semibold text-neutral-700 outline-none focus:border-fizz"
      >
        <option value="">All</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button className="mt-2 w-full rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white">Apply</button>
    </form>
  );
}
