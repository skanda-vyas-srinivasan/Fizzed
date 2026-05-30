import { SodaCard } from "@/components/SodaCard";
import { getTopSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";

export default async function TopSodasPage() {
  await ensureSodasSeeded();
  const sodas = await getTopSodas();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Top Sodas" description="The highest rated sodas in the catalog." />
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {sodas.map((soda) => (
          <SodaCard key={soda.id} soda={soda} />
        ))}
      </div>
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <h1 className="text-3xl font-extrabold text-white">{title}</h1>
      <p className="mt-1 text-sm font-semibold text-[#CBBCC2]">{description}</p>
    </div>
  );
}
