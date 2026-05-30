import Link from "next/link";
import { createDiscussionPost } from "@/app/actions";
import { getCurrentUser, getDiscussionPosts } from "@/lib/data";
import type { DiscussionPost } from "@/lib/types";

export default async function DiscussionPage({ searchParams }: { searchParams: { message?: string } }) {
  const [user, posts] = await Promise.all([getCurrentUser(), getDiscussionPosts()]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Discussion</h1>
          <p className="mt-1 text-sm font-semibold text-[#AFA1A8]">Recommendations, rankings, finds, and site talk.</p>
        </div>
      </header>

      {searchParams.message ? <StatusMessage message={searchParams.message} /> : null}

      <section className="overflow-hidden rounded border border-[#4A3B43] bg-[#211A1F]">
        <div className="border-b border-[#4A3B43] bg-[#2B2228] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3]">
          Fizzed board
        </div>
        <div className="grid grid-cols-[1fr_88px_180px] border-b border-white/10 bg-[#1B1519] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288] max-md:hidden">
          <div>Topic</div>
          <div className="text-center">Replies</div>
          <div className="text-right">Last activity</div>
        </div>
        <div>
          {posts.length ? posts.map((post) => <ForumTopic key={post.id} post={post} />) : <EmptyBoard />}
        </div>
      </section>

      <section>
        {user ? (
          <details className="group overflow-hidden rounded border border-[#4A3B43] bg-[#211A1F]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#2B2228] px-4 py-3 marker:hidden">
              <div>
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Start a topic</h2>
                <p className="mt-1 text-xs font-semibold text-[#8F8288]">Open a thread on the board.</p>
              </div>
              <span className="shrink-0 rounded bg-[#E58A84] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110] group-open:hidden">New thread</span>
              <span className="hidden shrink-0 rounded bg-[#4A3B43] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3] group-open:inline-block">Close</span>
            </summary>
            <form action={createDiscussionPost} className="grid gap-3 border-t border-white/10 px-4 py-4 md:grid-cols-[280px_1fr_auto] md:items-start">
              <input
                name="title"
                required
                minLength={4}
                maxLength={120}
                placeholder="Topic title"
                className="w-full rounded border border-white/10 bg-[#362B32] px-3 py-2 text-sm font-semibold outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
              />
              <textarea
                name="body"
                required
                minLength={4}
                rows={3}
                placeholder="Post body"
                className="w-full resize-none rounded border border-white/10 bg-[#362B32] px-3 py-2 text-sm font-semibold leading-6 outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
              />
              <button className="rounded bg-[#E58A84] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">Post topic</button>
            </form>
          </details>
        ) : (
          <div className="rounded border border-white/10 bg-[#211A1F] px-4 py-4 text-sm font-semibold leading-6 text-[#CBBCC2]">
            <Link href="/auth/sign-in" className="font-extrabold text-[#D9A6B5] hover:text-white">
              Sign in
            </Link>{" "}
            to start a topic or reply.
          </div>
        )}
      </section>
    </div>
  );
}

function StatusMessage({ message }: { message: string }) {
  const schemaMissing = message.includes("discussion_posts") || message.includes("discussion_replies") || message.includes("schema cache");
  const displayMessage = schemaMissing ? "Discussion tables are not installed in Supabase yet. Run supabase/discussion_schema.sql in the SQL editor, then post again." : message;

  return <div className="rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{displayMessage}</div>;
}

function ForumTopic({ post }: { post: DiscussionPost }) {
  const replies = post.replies || [];
  const latest = replies[replies.length - 1];
  const latestDate = new Date(latest?.created_at || post.created_at).toLocaleDateString();

  return (
    <Link href={`/discussion/${post.id}`} className="block border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-[#2B2228]">
      <div className="grid gap-3 md:grid-cols-[1fr_88px_180px] md:items-center">
        <div className="min-w-0">
          <h2 className="line-clamp-1 text-base font-extrabold text-white">{post.title}</h2>
          <p className="mt-1 text-xs font-semibold text-[#8F8288]">
            by <span className="text-[#F8F1F3]">@{post.profiles?.username || "Fizzed user"}</span> · {new Date(post.created_at).toLocaleDateString()}
          </p>
          <p className="mt-2 line-clamp-1 text-xs leading-5 text-[#CBBCC2]">{post.body}</p>
        </div>
        <div className="text-sm font-extrabold text-[#E8C879] md:text-center">{replies.length}</div>
        <div className="text-xs font-semibold text-[#8F8288] md:text-right">
          {latestDate}
          {latest?.profiles?.username ? <div className="mt-1">by <span className="text-[#F8F1F3]">@{latest.profiles.username}</span></div> : null}
        </div>
      </div>
    </Link>
  );
}

function EmptyBoard() {
  return <div className="px-4 py-8 text-sm font-semibold text-[#CBBCC2]">No topics yet.</div>;
}
