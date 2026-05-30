import { notFound } from "next/navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { getProfile, getProfileRatings } from "@/lib/data";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const ratings = await getProfileRatings(profile.id);
  const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length : 0;

  return (
    <div className="space-y-8">
      <section className="rounded border border-white/10 bg-[#1b2229] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded bg-[#202932] text-4xl font-black text-[#00c030] ring-1 ring-white/10">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff8000]">Profile</p>
            <h1 className="mt-1 text-5xl font-extrabold tracking-tight text-white">@{profile.username}</h1>
            <p className="mt-3 max-w-2xl text-[#9aa5b1]">{profile.bio || "No bio yet."}</p>
            {profile.location ? <p className="mt-2 text-sm font-bold text-[#667483]">{profile.location}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <Stat value={String(ratings.length)} label="Ratings" />
            <Stat value={average.toFixed(1)} label="Average" />
          </div>
        </div>
      </section>

      <section>
        <div className="border-b border-white/10 pb-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa5b1]">Diary</p>
          <h2 className="mt-1 text-xl font-extrabold text-white">Recent ratings</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {ratings.length ? ratings.map((rating) => <ReviewCard key={rating.id} rating={{ ...rating, profiles: profile }} />) : <div className="rounded border border-white/10 bg-[#1b2229] p-6 text-[#9aa5b1]">No ratings yet.</div>}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded bg-[#202932] p-4 text-center">
      <div className="text-3xl font-extrabold text-white">{value}</div>
      <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9aa5b1]">{label}</div>
    </div>
  );
}
