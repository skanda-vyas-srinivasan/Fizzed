import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton } from "@/components/FollowButton";
import { ProfileIdentity } from "@/components/ProfileIdentity";
import { SodaArtwork } from "@/components/SodaArtwork";
import { Stars } from "@/components/Stars";
import {
  getCurrentProfileId,
  getCurrentUser,
  getFollowState,
  getProfile,
  getProfileDiscussionPosts,
  getProfileFollowers,
  getProfileFollowing,
  getProfileRatings
} from "@/lib/data";
import type { DiscussionPost, Profile, Rating } from "@/lib/types";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const [ratings, posts, currentProfileId, currentUser, followState, followers, following] = await Promise.all([
    getProfileRatings(profile.id),
    getProfileDiscussionPosts(profile.id),
    getCurrentProfileId(),
    getCurrentUser(),
    getFollowState(profile.id),
    getProfileFollowers(profile.id, 4),
    getProfileFollowing(profile.id, 4)
  ]);
  const isOwnProfile = currentProfileId === profile.id;
  const scoredRatings = ratings.filter((rating) => rating.score !== null);
  const average = scoredRatings.length ? scoredRatings.reduce((sum, rating) => sum + (rating.score || 0), 0) / scoredRatings.length : 0;
  const reviewed = ratings.filter((rating) => rating.review_text && rating.review_text.trim()).slice(0, 6);
  const distribution = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: ratings.filter((rating) => rating.score === score).length
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <section className="border-b border-white/10 pb-7 pt-7">
        <div className="grid gap-6 lg:grid-cols-[132px_minmax(260px,1fr)_minmax(360px,460px)] lg:items-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-4xl font-black text-[#9AA0A6] md:h-32 md:w-32">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-5">
            <ProfileIdentity profile={profile} editable={isOwnProfile} />
            <FollowButton
              profileId={profile.id}
              username={profile.username || ""}
              isOwnProfile={isOwnProfile}
              isFollowing={followState.isFollowing}
              isSignedIn={Boolean(currentUser)}
            />
          </div>
          <div className="grid overflow-hidden rounded border border-white/10 bg-white/10 text-center sm:grid-cols-5 lg:justify-self-end">
            <Stat value={String(ratings.length)} label="Ratings" />
            <Stat value={String(reviewed.length)} label="Reviews" />
            <Stat value={String(followState.following)} label="Following" />
            <Stat value={String(followState.followers)} label="Followers" />
            <Stat value={average.toFixed(1)} label="Average" />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-8 lg:grid-cols-[1fr_300px]">
        <main className="space-y-10">
          <ShelfSection id="ratings" title="Recently rated" ratings={ratings.slice(0, 10)} empty="No ratings yet." />

          <section id="reviews">
            <SectionHeader title="Recent reviews" />
            <div className="mt-4">
              {reviewed.length ? reviewed.map((rating) => <ReviewRow key={rating.id} rating={rating} />) : <EmptyLine text="No written reviews yet." />}
            </div>
          </section>

          <section id="discussion">
            <SectionHeader title="Discussion posts" href={`/profile/${profile.username}/discussion`} />
            <div className="mt-4 space-y-4">
              {posts.length ? posts.map((post) => <PostTile key={post.id} post={post} />) : <EmptyLine text="No discussion posts yet." />}
            </div>
          </section>
        </main>

        <aside className="h-fit space-y-5 bg-[#2B2228] p-4">
          <div className="rounded border border-white/10 bg-[#211A1F] p-4">
            <SectionHeader title="Rating distribution" />
            <div className="mt-4 space-y-2">
              {distribution.map((row) => (
                <DistributionRow key={row.score} score={row.score} count={row.count} max={Math.max(1, ...distribution.map((item) => item.count))} />
              ))}
            </div>
          </div>

          <PeopleList id="followers" title="Followers" href={`/profile/${profile.username}/followers`} people={followers} empty="No followers yet." />
          <PeopleList id="following" title="Following" href={`/profile/${profile.username}/following`} people={following} empty="Not following anyone yet." />
        </aside>
      </section>
    </div>
  );
}

function ShelfSection({ id, title, ratings, empty }: { id: string; title: string; ratings: Rating[]; empty: string }) {
  return (
    <section id={id}>
      <SectionHeader title={title} />
      {ratings.length ? (
        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-5">
          {ratings.map((rating) => (rating.sodas ? <ProfileSoda key={rating.id} rating={rating} /> : null))}
        </div>
      ) : (
        <EmptyLine text={empty} />
      )}
    </section>
  );
}

function ProfileSoda({ rating }: { rating: Rating }) {
  const soda = rating.sodas;
  if (!soda) return null;

  return (
    <Link href={`/soda/${soda.id}`} className="group block">
      <SodaArtwork soda={soda} />
      <div className="mt-2 min-w-0">
        <div className="truncate text-sm font-extrabold text-white group-hover:text-[#D9A6B5]">{soda.name}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#E8C879]">{rating.score === null ? "NR" : `${rating.score}.0`}</span>
          <Stars value={rating.score} size="text-xs" />
        </div>
      </div>
    </Link>
  );
}

function ReviewRow({ rating }: { rating: Rating }) {
  const soda = rating.sodas;
  if (!soda) return null;

  return (
    <article className="grid grid-cols-[64px_1fr] gap-4 border-b border-white/10 py-4">
      <Link href={`/soda/${soda.id}`} className="block">
        <SodaArtwork soda={soda} />
      </Link>
      <div>
        <Link href={`/soda/${soda.id}`} className="text-sm font-extrabold text-white hover:text-[#D9A6B5]">
          {soda.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#E8C879]">{rating.score === null ? "NR" : `${rating.score}.0`}</span>
          <Stars value={rating.score} size="text-xs" />
        </div>
        <p className="mt-3 text-sm leading-6 text-[#F8F1F3]">{rating.review_text}</p>
      </div>
    </article>
  );
}

function PostTile({ post }: { post: DiscussionPost }) {
  return (
    <Link href={`/discussion/${post.id}`} className="block border-b border-white/10 pb-4 hover:border-[#D9A6B5]/50">
      <h3 className="text-base font-extrabold text-white">{post.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#CBBCC2]">{post.body}</p>
      <div className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#E8C879]">{post.replies?.length || 0} replies</div>
    </Link>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/15 pb-2">
      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">{title}</h2>
      {href ? (
        <Link href={href} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          View all
        </Link>
      ) : null}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[86px] bg-[#211A1F] px-3 py-4">
      <div className="text-2xl font-extrabold leading-none text-white">{value}</div>
      <div className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">{label}</div>
    </div>
  );
}

function PeopleList({ id, title, href, people, empty }: { id: string; title: string; href: string; people: Profile[]; empty: string }) {
  return (
    <section id={id} className="rounded border border-white/10 bg-[#211A1F] p-4">
      <SectionHeader title={title} href={href} />
      <div className="mt-3 space-y-2">
        {people.length ? people.map((person) => <PersonRow key={person.id} profile={person} />) : <div className="py-2 text-sm font-semibold text-[#8F8288]">{empty}</div>}
      </div>
    </section>
  );
}

function PersonRow({ profile }: { profile: Profile }) {
  const username = profile.username || "Fizzed user";
  return (
    <Link href={`/profile/${username}`} className="flex items-center gap-3 rounded px-2 py-2 hover:bg-[#362B32]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-xs font-black text-[#9AA0A6]">
        {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-extrabold text-white">@{username}</div>
        {profile.location ? <div className="truncate text-[11px] font-semibold text-[#8F8288]">{profile.location}</div> : null}
      </div>
    </Link>
  );
}

function DistributionRow({ score, count, max }: { score: number; count: number; max: number }) {
  return (
    <div className="grid grid-cols-[44px_1fr_22px] items-center gap-2 text-[11px] font-semibold text-[#CBBCC2]">
      <span>{score}★</span>
      <div className="h-2 bg-[#362B32]">
        <div className="h-full bg-[#A8E39C]" style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span>{count}</span>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="mt-4 border-b border-white/10 pb-4 text-sm font-semibold text-[#CBBCC2]">{text}</div>;
}
