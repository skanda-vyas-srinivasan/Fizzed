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
      <div className="rounded border border-white/10 bg-[#21171B] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F6C453]">Log</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Add a diary entry</h1>
        <p className="mt-3 text-[#B8A7AC]">Score it from 1 to 5 and leave a tasting note.</p>

        {searchParams.message ? <div className="mt-5 rounded border border-[#F6C453]/30 bg-[#F6C453]/10 px-4 py-3 text-sm font-bold text-[#FFE1A3]">{searchParams.message}</div> : null}

        <form action={createRating} className="mt-8 space-y-5">
          <Field label="Soda">
            <select name="soda_id" defaultValue={selected?.id} required className="w-full rounded border border-white/10 bg-[#2A1E23] px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF7A70]">
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
              className="w-full resize-none rounded border border-white/10 bg-[#2A1E23] px-4 py-3 text-sm outline-none placeholder:text-[#7F6970] focus:border-[#FF7A70]"
            />
          </Field>

          <button className="w-full rounded bg-[#D8423A] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#180807]">Save rating</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#B8A7AC]">{label}</label>
      {children}
    </div>
  );
}
