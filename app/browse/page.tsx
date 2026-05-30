import Link from "next/link";
import { SodaCard } from "@/components/SodaCard";
import { getBrowseFacets, getSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";

export default async function Browse({ searchParams }: { searchParams: { q?: string; brand?: string; country?: string; category?: string } }) {
  await ensureSodasSeeded();
  const [sodas, facets] = await Promise.all([getSodas(searchParams), getBrowseFacets()]);

  return (
    <div className="space-y-7">
      <div className="border-b border-white/10 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F6C453]">Browse</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Sodas</h1>
            <p className="mt-1 text-sm font-medium text-[#B8A7AC]">{sodas.length} entries from The Soda Wiki catalog</p>
          </div>
          <form className="flex w-full gap-2 lg:w-auto">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search soda or brand"
              className="min-w-0 flex-1 rounded border border-white/10 bg-[#2A1E23] px-3 py-2 text-sm outline-none placeholder:text-[#7F6970] focus:border-[#FF7A70] lg:w-80"
            />
            <button className="rounded bg-[#D8423A] px-4 py-2 text-sm font-extrabold text-[#180807]">Search</button>
          </form>
        </div>
      </div>

      <div className="grid gap-3 rounded border border-white/10 bg-[#21171B] p-3 md:grid-cols-[1fr_1fr_auto]">
        <Facet name="category" value={searchParams.category} items={facets.categories} label="Category" />
        <Facet name="brand" value={searchParams.brand} items={facets.brands} label="Brand" />
        <Link href="/browse" className="flex items-end justify-center rounded bg-[#3A2A31] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#B8A7AC] hover:text-white">
          Clear
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {sodas.map((soda) => (
          <SodaCard key={soda.id} soda={soda} />
        ))}
      </div>
    </div>
  );
}

function Facet({ name, value, items, label }: { name: string; value?: string; items: string[]; label: string }) {
  return (
    <form className="grid gap-2">
      <label className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#B8A7AC]">{label}</label>
      <div className="flex gap-2">
        <select
          name={name}
          defaultValue={value || ""}
          className="min-w-0 flex-1 rounded border border-white/10 bg-[#2A1E23] px-3 py-2 text-sm font-semibold outline-none focus:border-[#FF7A70]"
        >
          <option value="">All</option>
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="rounded bg-[#3A2A31] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#F4ECEE]">Apply</button>
      </div>
    </form>
  );
}
