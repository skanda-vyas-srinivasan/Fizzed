import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";

export default async function OnboardingPage({ searchParams }: { searchParams: { message?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-fizz">Finish setup</p>
      <h1 className="mt-2 font-display text-5xl font-black">Pick your Fizzed identity</h1>
      {searchParams.message ? <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-fizz">{searchParams.message}</div> : null}
      <form action={updateProfile} className="mt-8 space-y-4">
        <input
          name="username"
          required
          minLength={3}
          maxLength={24}
          defaultValue={profile?.username || ""}
          placeholder="Username"
          className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz"
        />
        <input
          name="location"
          defaultValue={profile?.location || ""}
          placeholder="Location"
          className="w-full rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz"
        />
        <textarea
          name="bio"
          rows={4}
          defaultValue={profile?.bio || ""}
          placeholder="Bio"
          className="w-full resize-none rounded-2xl border border-black/10 bg-cloud px-4 py-3 text-sm outline-none focus:border-fizz"
        />
        <button className="w-full rounded-full bg-fizz px-5 py-3 text-sm font-bold text-white">Save profile</button>
      </form>
    </div>
  );
}
