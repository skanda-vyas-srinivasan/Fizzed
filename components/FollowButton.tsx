import Link from "next/link";
import { followProfile, unfollowProfile } from "@/app/actions";

export function FollowButton({ profileId, username, isOwnProfile, isFollowing, isSignedIn }: { profileId: string; username: string; isOwnProfile: boolean; isFollowing: boolean; isSignedIn: boolean }) {
  if (isOwnProfile) return null;

  if (!isSignedIn) {
    return (
      <Link href="/auth/sign-in" className="inline-flex bg-[#4A3B43] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3] hover:bg-[#5A4951]">
        Sign in to follow
      </Link>
    );
  }

  return (
    <form action={isFollowing ? unfollowProfile : followProfile}>
      <input type="hidden" name="following_id" value={profileId} />
      <input type="hidden" name="username" value={username} />
      <button className={isFollowing ? "inline-flex bg-[#4A3B43] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3] hover:bg-[#5A4951]" : "inline-flex bg-[#E58A84] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2A1110] hover:bg-[#F0A19B]"}>
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </form>
  );
}
