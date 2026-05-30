import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";

export default async function OnboardingPage({ searchParams }: { searchParams: { message?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-xl rounded border border-white/10 bg-[#21171B] p-8 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F6C453]">Finish setup</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Pick your Fizzed identity</h1>
      {searchParams.message ? <div className="mt-5 rounded border border-[#F6C453]/30 bg-[#F6C453]/10 px-4 py-3 text-sm font-bold text-[#FFE1A3]">{searchParams.message}</div> : null}
      <form action={updateProfile} className="mt-8 space-y-4">
        <input name="username" required minLength={3} maxLength={24} defaultValue={profile?.username || ""} placeholder="Username" className="w-full rounded border border-white/10 bg-[#2A1E23] px-4 py-3 text-sm outline-none placeholder:text-[#7F6970] focus:border-[#FF7A70]" />
        <input name="location" defaultValue={profile?.location || ""} placeholder="Location" className="w-full rounded border border-white/10 bg-[#2A1E23] px-4 py-3 text-sm outline-none placeholder:text-[#7F6970] focus:border-[#FF7A70]" />
        <textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Bio" className="w-full resize-none rounded border border-white/10 bg-[#2A1E23] px-4 py-3 text-sm outline-none placeholder:text-[#7F6970] focus:border-[#FF7A70]" />
        <button className="w-full rounded bg-[#D8423A] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#180807]">Save profile</button>
      </form>
    </div>
  );
}
