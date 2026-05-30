import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfilePeopleSearch } from "@/components/ProfilePeopleSearch";
import { getProfile, getProfileFollowing } from "@/lib/data";
import type { Profile } from "@/lib/types";

export default async function FollowingPage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const following = await getProfileFollowing(profile.id);

  return <PeoplePage title={`${profile.username} is following`} backHref={`/profile/${profile.username}`} people={following} empty="Not following anyone yet." />;
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
