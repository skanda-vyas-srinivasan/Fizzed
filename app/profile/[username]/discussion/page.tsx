import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile, getProfileDiscussionPosts } from "@/lib/data";
import type { DiscussionPost } from "@/lib/types";

export default async function ProfileDiscussionPage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const posts = await getProfileDiscussionPosts(profile.id, 1000);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="border-b border-white/10 pb-4">
        <Link href={`/profile/${profile.username}`} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          Back to profile
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-white">@{profile.username} discussion posts</h1>
      </header>

      <section className="overflow-hidden rounded border border-[#4A3B43] bg-[#211A1F]">
        <div className="grid grid-cols-[1fr_88px_180px] border-b border-white/10 bg-[#1B1519] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288] max-md:hidden">
          <div>Topic</div>
          <div className="text-center">Replies</div>
          <div className="text-right">Last activity</div>
        </div>
        {posts.length ? posts.map((post) => <PostRow key={post.id} post={post} />) : <div className="px-4 py-8 text-sm font-semibold text-[#CBBCC2]">No discussion posts yet.</div>}
      </section>
    </div>
  );
}

function PostRow({ post }: { post: DiscussionPost }) {
  const replies = post.replies || [];
  const latest = replies[replies.length - 1];
  const latestDate = new Date(latest?.created_at || post.created_at).toLocaleDateString();

  return (
    <Link href={`/discussion/${post.id}`} className="block border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-[#2B2228]">
      <div className="grid gap-3 md:grid-cols-[1fr_88px_180px] md:items-center">
        <div className="min-w-0">
          <h2 className="line-clamp-1 text-base font-extrabold text-white">{post.title}</h2>
          <p className="mt-2 line-clamp-1 text-xs leading-5 text-[#CBBCC2]">{post.body}</p>
        </div>
        <div className="text-sm font-extrabold text-[#E8C879] md:text-center">{replies.length}</div>
        <div className="text-xs font-semibold text-[#8F8288] md:text-right">{latestDate}</div>
      </div>
    </Link>
  );
}
