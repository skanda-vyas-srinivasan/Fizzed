import { SodaCard } from "@/components/SodaCard";
import { getPopularSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";

export default async function PopularPage() {
  await ensureSodasSeeded();
  const sodas = await getPopularSodas();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-b border-white/10 pb-3">
        <h1 className="text-3xl font-extrabold text-white">Popular</h1>
        <p className="mt-1 text-sm font-semibold text-[#CBBCC2]">Sodas getting the most attention this month.</p>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {sodas.map((soda) => (
          <SodaCard key={soda.id} soda={soda} />
        ))}
      </div>
    </div>
  );
}
