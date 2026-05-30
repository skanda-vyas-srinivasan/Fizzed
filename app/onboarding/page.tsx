import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";
import { getCurrentProfile, getCurrentUser, getHomeData, getTopSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";
import type { Soda } from "@/lib/types";

export default async function OnboardingPage({ searchParams }: { searchParams: { message?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const profile = await getCurrentProfile();
  if (profile?.username) redirect(`/profile/${profile.username}`);

  await ensureSodasSeeded();
  const [{ sodas }, topSodas] = await Promise.all([getHomeData(), getTopSodas(5)]);

  return (
    <div className="relative -mt-8 min-h-[calc(100vh-156px)] overflow-hidden py-8">
      <div aria-hidden="true" inert className="pointer-events-none select-none blur-[3px] opacity-35">
        <HomePreview sodas={sodas.slice(0, 12)} topSodas={topSodas.slice(0, 5)} />
      </div>

      <div className="absolute inset-0 bg-[#1B1519]/55" />

      <section className="absolute inset-x-4 top-16 mx-auto max-w-lg rounded border border-white/15 bg-[#2B2228]/95 p-6 shadow-[0_12px_32px_rgba(24,18,21,0.24)] sm:top-20 sm:p-8">
        <h1 className="text-4xl font-extrabold tracking-[-0.025em] text-white sm:text-5xl">Pick a username</h1>
        <p className="mt-3 text-sm font-semibold text-[#CBBCC2]">You can change it later.</p>
        {searchParams.message ? (
          <div className="mt-5 rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{searchParams.message}</div>
        ) : null}
        <form action={updateProfile} className="mt-6 space-y-4">
          <input type="hidden" name="redirect_to" value="/" />
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2]">Username</span>
            <input
              name="username"
              required
              minLength={3}
              maxLength={24}
              defaultValue={profile?.username || ""}
              autoFocus
              autoComplete="username"
              placeholder="Username"
              className="w-full rounded border border-white/10 bg-[#362B32] px-4 py-3 text-base font-bold text-[#F8F1F3] outline-none placeholder:text-[#9F9097] focus:border-[#D9A6B5]"
            />
          </label>
          <button className="w-full rounded bg-[#E58A84] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#2A1110] hover:bg-[#F0A19B] focus:outline-none focus:ring-2 focus:ring-[#D9A6B5] focus:ring-offset-2 focus:ring-offset-[#2B2228]">
            Create profile
          </button>
        </form>
      </section>
    </div>
  );
}

function HomePreview({ sodas, topSodas }: { sodas: Soda[]; topSodas: Soda[] }) {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section>
        <PreviewHeader title="Check these out" />
        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6">
          {sodas.map((soda) => (
            <div key={soda.id}>
              <SodaArtwork soda={soda} />
              <div className="mt-2 truncate text-sm font-bold text-[#F8F1F3]">{soda.name}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <Stars value={soda.avg_rating} size="text-xs" />
                <span className="text-xs font-bold text-[#CBBCC2]">{Number(soda.avg_rating).toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <PreviewHeader title="Recent reviews" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 border-b border-white/10 bg-[#2B2228]" />
            ))}
          </div>
        </div>
        <div>
          <PreviewHeader title="Top sodas" />
          <div className="mt-4 space-y-3">
            {topSodas.map((soda) => (
              <div key={soda.id} className="flex gap-3 border-b border-white/10 pb-3">
                <div className="w-10 shrink-0">
                  <SodaArtwork soda={soda} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-extrabold text-white">{soda.name}</div>
                  <div className="mt-1 text-[11px] font-extrabold text-[#E8C879]">{Number(soda.avg_rating || 0).toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewHeader({ title }: { title: string }) {
  return (
    <div className="flex items-end justify-between border-b border-white/10 pb-2">
      <h2 className="text-2xl font-extrabold text-white">{title}</h2>
    </div>
  );
}
