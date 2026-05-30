import { notFound } from "next/navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { getProfile, getProfileRatings } from "@/lib/data";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const ratings = await getProfileRatings(profile.id);
  const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-50 font-display text-4xl font-black text-fizz ring-1 ring-black/5">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">Profile</p>
            <h1 className="mt-1 font-display text-5xl font-black">@{profile.username}</h1>
            <p className="mt-3 max-w-2xl text-neutral-600">{profile.bio || "No bio yet."}</p>
            {profile.location ? <p className="mt-2 text-sm font-semibold text-neutral-400">{profile.location}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <Stat value={String(ratings.length)} label="Ratings" />
            <Stat value={average.toFixed(1)} label="Average" />
          </div>
        </div>
      </section>

      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">Diary</p>
        <h2 className="mb-4 font-display text-3xl font-black">Recent ratings</h2>
        <div className="grid gap-4">
          {ratings.length ? (
            ratings.map((rating) => <ReviewCard key={rating.id} rating={{ ...rating, profiles: profile }} />)
          ) : (
            <div className="rounded-[1.6rem] bg-white p-8 text-neutral-500 ring-1 ring-black/5">No ratings yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.3rem] bg-cloud p-4 text-center">
      <div className="font-display text-3xl font-black">{value}</div>
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">{label}</div>
    </div>
  );
}
