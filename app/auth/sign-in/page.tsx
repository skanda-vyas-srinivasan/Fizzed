import { signInWithGoogle } from "@/app/actions";

export default function SignInPage({ searchParams }: { searchParams: { message?: string } }) {
  return (
    <section className="mx-auto max-w-6xl py-6 sm:py-14">
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#F8F1F3] sm:text-5xl">Get started with Fizzed</h1>
      {searchParams.message ? <div className="mt-8 max-w-xl rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{searchParams.message}</div> : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-[360px_1fr] lg:gap-28">
        <div className="space-y-5">
          <form action={signInWithGoogle}>
            <button className="flex h-16 w-full items-center rounded-full border border-[#6B6268] bg-transparent px-7 text-left text-lg font-bold text-[#D9D3D6] transition hover:border-[#E58A84] hover:text-white">
              <span className="mr-8 text-3xl font-black text-[#E65B45]">G</span>
              Continue with Google
            </button>
          </form>

          <p className="px-2 text-sm font-semibold leading-6 text-[#8F858A]">
            Email sign-in is disabled while Fizzed is in early setup. Google is the only login method for now.
          </p>
        </div>

        <div className="space-y-9 pt-1">
          <Feature title="Rate & Review Sodas">Score bottles, cans, fountain pulls, and regional finds from 1 to 5.</Feature>
          <Feature title="Build Your Soda Shelf">Keep a personal log of what you have tried and what is worth finding again.</Feature>
          <Feature title="Browse the Catalog">Search a cleaner Soda Wiki-based catalog by name, brand, and flavor cues.</Feature>
          <Feature title="Follow Taste">See friends' ratings and build a feed around weird drinks, classics, and new finds.</Feature>
          <Feature title="Find the Next One">Use ratings and reviews to decide what deserves a spot in the cooler.</Feature>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#F8F1F3]">{title}</h2>
      <p className="mt-3 max-w-xl text-lg font-semibold leading-7 text-[#8F858A]">{children}</p>
    </section>
  );
}
