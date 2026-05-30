import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/app/actions";

export default function SignInPage({ searchParams }: { searchParams: { message?: string } }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">Welcome back</p>
        <h1 className="mt-2 font-display text-5xl font-black">Sign in to Fizzed</h1>
        {searchParams.message ? (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-fizz">{searchParams.message}</div>
        ) : null}
        <form action={signInWithGoogle} className="mt-8">
          <button className="w-full rounded-full border border-black/10 bg-cloud px-5 py-3 text-sm font-bold text-neutral-800">
            Continue with Google
          </button>
        </form>
        <form action={signInWithEmail} className="mt-5 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz" />
          <button className="w-full rounded-full bg-fizz px-5 py-3 text-sm font-bold text-white">Sign in</button>
        </form>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">New here</p>
        <h2 className="mt-2 font-display text-5xl font-black">Claim a username</h2>
        <form action={signUpWithEmail} className="mt-8 space-y-4">
          <input name="username" required minLength={3} maxLength={24} placeholder="Username" className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz" />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz" />
          <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz" />
          <button className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-bold text-white">Create account</button>
        </form>
      </section>
    </div>
  );
}
