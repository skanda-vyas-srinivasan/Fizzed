import Link from "next/link";
import { createSodaList } from "@/app/actions";
import { getCurrentUser, getSodaLists } from "@/lib/data";

export default async function ListsPage({ searchParams }: { searchParams: { message?: string } }) {
  const [user, lists] = await Promise.all([getCurrentUser(), getSodaLists()]);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div className="border-b border-white/10 pb-3">
        <h1 className="text-3xl font-extrabold text-white">Lists</h1>
      </div>

      {searchParams.message ? <div className="rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{searchParams.message}</div> : null}

      <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="h-fit rounded border border-white/10 bg-[#2B2228] p-4">
          <h2 className="border-b border-white/10 pb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Create a list</h2>
          {user ? (
            <form action={createSodaList} className="mt-4 space-y-3">
              <input
                name="title"
                required
                minLength={3}
                maxLength={120}
                placeholder="List title"
                className="w-full rounded border border-white/10 bg-[#362B32] px-3 py-2 text-sm font-semibold outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
              />
              <textarea
                name="description"
                rows={5}
                placeholder="What belongs here?"
                className="w-full resize-none rounded border border-white/10 bg-[#362B32] px-3 py-2 text-sm font-semibold outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
              />
              <button className="w-full rounded bg-[#E58A84] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">Create list</button>
            </form>
          ) : (
            <div className="mt-4 text-sm font-semibold leading-6 text-[#CBBCC2]">
              <Link href="/auth/sign-in" className="font-extrabold text-[#D9A6B5] hover:text-white">
                Sign in
              </Link>{" "}
              to create a list.
            </div>
          )}
        </div>

        <div className="space-y-4">
          {lists.map((list) => (
            <article key={list.id} className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-extrabold text-white">{list.title}</h2>
              {list.description ? <p className="mt-2 text-sm leading-6 text-[#CBBCC2]">{list.description}</p> : null}
              <p className="mt-3 text-[11px] font-semibold text-[#8F8288]">
                by {list.profiles?.username ? `@${list.profiles.username}` : "Fizzed user"} · {new Date(list.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
