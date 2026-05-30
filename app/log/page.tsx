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
      <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">Log</p>
        <h1 className="mt-2 font-display text-5xl font-black">Add a soda diary entry</h1>
        <p className="mt-3 text-neutral-500">Score it from 1 to 5 and leave the tasting note you wish the can had printed on it.</p>

        {searchParams.message ? (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-fizz">{searchParams.message}</div>
        ) : null}

        <form action={createRating} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-700">Soda</label>
            <select
              name="soda_id"
              defaultValue={selected?.id}
              required
              className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm font-semibold outline-none focus:border-fizz"
            >
              {sodas.map((soda) => (
                <option key={soda.id} value={soda.id}>
                  {soda.name} · {soda.brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-700">Rating</label>
            <StarInput />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-700">Review</label>
            <textarea
              name="review_text"
              rows={6}
              placeholder="Crisp, too sweet, perfect with pizza..."
              className="w-full resize-none rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz"
            />
          </div>

          <button className="w-full rounded-full bg-fizz px-5 py-3 text-sm font-bold text-white">Save rating</button>
        </form>
      </div>
    </div>
  );
}
