import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";

export default async function OnboardingPage({ searchParams }: { searchParams: { message?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-xl rounded border border-white/10 bg-[#1b2229] p-8 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff8000]">Finish setup</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Pick your Fizzed identity</h1>
      {searchParams.message ? <div className="mt-5 rounded border border-[#ff8000]/30 bg-[#ff8000]/10 px-4 py-3 text-sm font-bold text-[#ffb15c]">{searchParams.message}</div> : null}
      <form action={updateProfile} className="mt-8 space-y-4">
        <input name="username" required minLength={3} maxLength={24} defaultValue={profile?.username || ""} placeholder="Username" className="w-full rounded border border-white/10 bg-[#202932] px-4 py-3 text-sm outline-none placeholder:text-[#667483] focus:border-[#40bcf4]" />
        <input name="location" defaultValue={profile?.location || ""} placeholder="Location" className="w-full rounded border border-white/10 bg-[#202932] px-4 py-3 text-sm outline-none placeholder:text-[#667483] focus:border-[#40bcf4]" />
        <textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Bio" className="w-full resize-none rounded border border-white/10 bg-[#202932] px-4 py-3 text-sm outline-none placeholder:text-[#667483] focus:border-[#40bcf4]" />
        <button className="w-full rounded bg-[#00c030] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#071009]">Save profile</button>
      </form>
    </div>
  );
}
