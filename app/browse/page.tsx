import { SodaCard } from "@/components/SodaCard";
import Link from "next/link";
import { getProfiles, getSodas } from "@/lib/data";
import { ensureSodasSeeded } from "@/lib/seed";
import type { Profile } from "@/lib/types";

export default async function Browse({ searchParams }: { searchParams: { q?: string; brand?: string; country?: string; category?: string } }) {
  await ensureSodasSeeded();
  const [sodas, profiles] = await Promise.all([getSodas(searchParams), getProfiles(searchParams)]);
  const hasQuery = Boolean(searchParams.q?.trim());

  return (
    <div className="space-y-7">
      <div className="border-b border-white/10 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E8C879]">Browse</p>
        <div className="mt-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{hasQuery ? `Search: ${searchParams.q}` : "Sodas"}</h1>
            <p className="mt-1 text-sm font-medium text-[#CBBCC2]">
              {hasQuery ? `${profiles.length} users · ${sodas.length} sodas` : `${sodas.length} entries from The Soda Wiki catalog`}
            </p>
          </div>
        </div>
      </div>

      {hasQuery ? (
        <section>
          <SectionHeader title="Users" />
          {profiles.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <ProfileResult key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <EmptyLine text="No users found." />
          )}
        </section>
      ) : null}

      <section>
        {hasQuery ? <SectionHeader title="Sodas" /> : null}
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {sodas.map((soda) => (
          <SodaCard key={soda.id} soda={soda} />
        ))}
      </div>
      </section>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-white/10 pb-2">
      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">{title}</h2>
    </div>
  );
}

function ProfileResult({ profile }: { profile: Profile }) {
  return (
    <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 border-b border-white/10 pb-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-sm font-black text-[#4A3B43]">
        {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username?.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-extrabold text-white">@{profile.username}</div>
        {profile.bio ? <div className="line-clamp-1 text-xs font-semibold text-[#CBBCC2]">{profile.bio}</div> : null}
        {profile.location ? <div className="text-[11px] font-semibold text-[#8F8288]">{profile.location}</div> : null}
      </div>
    </Link>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="mt-4 border-b border-white/10 pb-4 text-sm font-semibold text-[#CBBCC2]">{text}</div>;
}
