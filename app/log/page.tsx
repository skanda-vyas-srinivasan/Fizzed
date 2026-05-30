import { redirect } from "next/navigation";
import { StarInput } from "@/components/Stars";
import { createRating } from "@/app/actions";
import { getCurrentUser, getSoda, getSodas } from "@/lib/data";

export default async function LogPage({ searchParams }: { searchParams: { soda?: string; message?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const selected = searchParams.soda ? await getSoda(searchParams.soda) : null;
  const sodas = selected ? [selected] : await getSodas({});

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded border border-white/10 bg-[#2B2228] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E8C879]">Log</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Add a diary entry</h1>
        <p className="mt-3 text-[#CBBCC2]">Score it from 1 to 5 and leave a tasting note.</p>

        {searchParams.message ? <div className="mt-5 rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{searchParams.message}</div> : null}

        <form action={createRating} className="mt-8 space-y-5">
          <Field label="Soda">
            <select name="soda_id" defaultValue={selected?.id} required className="w-full rounded border border-white/10 bg-[#362B32] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D9A6B5]">
              {sodas.map((soda) => (
                <option key={soda.id} value={soda.id}>
                  {soda.name} · {soda.brand === "Unknown" ? soda.category : soda.brand}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Rating">
            <StarInput />
          </Field>

          <Field label="Review">
            <textarea
              name="review_text"
              rows={6}
              placeholder="Crisp, too sweet, perfect with pizza..."
              className="w-full resize-none rounded border border-white/10 bg-[#362B32] px-4 py-3 text-sm outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
            />
          </Field>

          <button className="w-full rounded bg-[#E58A84] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">Save rating</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#CBBCC2]">{label}</label>
      {children}
    </div>
  );
}
