import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfilePeopleSearch } from "@/components/ProfilePeopleSearch";
import { getProfile, getProfileFollowers } from "@/lib/data";
import type { Profile } from "@/lib/types";

export default async function FollowersPage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const followers = await getProfileFollowers(profile.id);

  return <PeoplePage title={`${profile.username}'s followers`} backHref={`/profile/${profile.username}`} people={followers} empty="No followers yet." />;
}

function PeoplePage({ title, backHref, people, empty }: { title: string; backHref: string; people: Profile[]; empty: string }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="border-b border-white/10 pb-4">
        <Link href={backHref} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          Back to profile
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-white">{title}</h1>
      </header>

      <ProfilePeopleSearch people={people} empty={empty} />
    </div>
  );
}
