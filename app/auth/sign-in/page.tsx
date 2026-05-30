import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/app/actions";

export default function SignInPage({ searchParams }: { searchParams: { message?: string } }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <AuthPanel eyebrow="Welcome back" title="Sign in to Fizzed">
        {searchParams.message ? <div className="rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{searchParams.message}</div> : null}
        <form action={signInWithGoogle}>
          <button className="w-full rounded border border-white/10 bg-[#362B32] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3] hover:bg-[#4A3B43]">
            Continue with Google
          </button>
        </form>
        <form action={signInWithEmail} className="space-y-4">
          <AuthInput name="email" type="email" placeholder="Email" />
          <AuthInput name="password" type="password" placeholder="Password" />
          <button className="w-full rounded bg-[#E58A84] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">Sign in</button>
        </form>
      </AuthPanel>

      <AuthPanel eyebrow="New here" title="Claim a username">
        <form action={signUpWithEmail} className="space-y-4">
          <AuthInput name="username" placeholder="Username" minLength={3} maxLength={24} />
          <AuthInput name="email" type="email" placeholder="Email" />
          <AuthInput name="password" type="password" placeholder="Password" minLength={6} />
          <button className="w-full rounded bg-[#E8C879] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#2A1D07]">Create account</button>
        </form>
      </AuthPanel>
    </div>
  );
}

function AuthPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-white/10 bg-[#2B2228] p-8 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E8C879]">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
      <div className="mt-8 space-y-5">{children}</div>
    </section>
  );
}

function AuthInput({ name, type = "text", placeholder, minLength, maxLength }: { name: string; type?: string; placeholder: string; minLength?: number; maxLength?: number }) {
  return (
    <input
      name={name}
      type={type}
      required
      minLength={minLength}
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full rounded border border-white/10 bg-[#362B32] px-4 py-3 text-sm outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
    />
  );
}
