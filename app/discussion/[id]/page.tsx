import { notFound } from "next/navigation";
import Link from "next/link";
import { createDiscussionReply } from "@/app/actions";
import { getCurrentUser, getDiscussionPost } from "@/lib/data";
import type { DiscussionReply } from "@/lib/types";

export default async function DiscussionThreadPage({ params, searchParams }: { params: { id: string }; searchParams: { message?: string; replyTo?: string; quote?: string } }) {
  const [user, post] = await Promise.all([getCurrentUser(), getDiscussionPost(params.id)]);
  if (!post) notFound();

  const replies = post.replies || [];
  const replyTo = searchParams.replyTo?.trim() || "";
  const quoteText = searchParams.quote?.trim() || "";

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="border-b border-white/10 pb-4">
        <Link href="/discussion" className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
          Back to discussion
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold leading-tight text-white">{post.title}</h1>
            <p className="mt-2 text-xs font-semibold text-[#8F8288]">
              by <ProfileLink username={post.profiles?.username} /> · {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold leading-none text-white">{replies.length}</div>
            <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">Replies</div>
          </div>
        </div>
      </header>

      {searchParams.message ? <StatusMessage message={searchParams.message} /> : null}

      <ForumPost
        username={post.profiles?.username}
        avatarUrl={post.profiles?.avatar_url}
        createdAt={post.created_at}
        body={post.body}
        label="Topic"
        postId={post.id}
      />

      <section className="overflow-hidden rounded border border-[#4A3B43] bg-[#211A1F]">
        <div className="border-b border-[#4A3B43] bg-[#2B2228] px-4 py-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Replies</h2>
        </div>
        {replies.length ? replies.map((reply) => <ReplyRow key={reply.id} reply={reply} postId={post.id} />) : <div className="px-4 py-8 text-sm font-semibold text-[#CBBCC2]">No replies yet.</div>}
      </section>

      {user ? (
        <form id="reply" action={createDiscussionReply} className="overflow-hidden rounded border border-[#4A3B43] bg-[#211A1F]">
          <input type="hidden" name="post_id" value={post.id} />
          <input type="hidden" name="quote_author" value={replyTo} />
          <input type="hidden" name="quote_text" value={quoteText} />
          <div className="border-b border-[#4A3B43] bg-[#2B2228] px-4 py-2">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Write a reply</div>
          </div>
          <div className="p-4">
            {replyTo && quoteText ? <QuotePreview author={replyTo} text={quoteText} /> : null}
            <label className="sr-only" htmlFor="reply-body">
              Reply body
            </label>
            <textarea
              id="reply-body"
              name="body"
              required
              minLength={2}
              rows={7}
              placeholder="Write your message here."
              className="block w-full resize-y rounded border border-[#4A3B43] bg-[#1B1519] px-4 py-3 text-sm font-semibold leading-7 text-[#F8F1F3] outline-none placeholder:text-[#8F8288] focus:border-[#D9A6B5]"
            />
          </div>
          <div className="flex items-center justify-between border-t border-white/10 bg-[#1B1519] px-4 py-3">
            <div className="text-[11px] font-semibold text-[#8F8288]">Keep it readable. Replies are public.</div>
            <button className="rounded bg-[#E58A84] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">Post reply</button>
          </div>
        </form>
      ) : (
        <div className="rounded border border-white/10 bg-[#211A1F] px-4 py-4 text-sm font-semibold leading-6 text-[#CBBCC2]">
          <Link href="/auth/sign-in" className="font-extrabold text-[#D9A6B5] hover:text-white">
            Sign in
          </Link>{" "}
          to reply.
        </div>
      )}
    </div>
  );
}

function ReplyRow({ reply, postId }: { reply: DiscussionReply; postId: string }) {
  return <ForumPost username={reply.profiles?.username} avatarUrl={reply.profiles?.avatar_url} createdAt={reply.created_at} body={reply.body} label="Reply" postId={postId} />;
}

function ForumPost({
  username,
  avatarUrl,
  createdAt,
  body,
  label,
  postId
}: {
  username?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  body: string;
  label: string;
  postId: string;
}) {
  const quote = body
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
  const replyHref = username ? `/discussion/${postId}?replyTo=${encodeURIComponent(username)}&quote=${encodeURIComponent(quote)}#reply` : `#reply`;

  return (
    <article className="overflow-hidden rounded border border-[#4A3B43] bg-[#211A1F]">
      <div className="border-b border-[#4A3B43] bg-[#2B2228] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">
        {label} · {new Date(createdAt).toLocaleString()}
      </div>
      <div className="grid md:grid-cols-[180px_1fr]">
        <aside className="border-b border-white/10 bg-[#1B1519] p-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 md:block">
            <ProfileAvatar username={username} avatarUrl={avatarUrl} />
            <div className="min-w-0 md:mt-3">
              <ProfileLink username={username} />
              <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">Member</div>
            </div>
          </div>
        </aside>
        <div className="min-h-[130px] p-5">
          <MessageBody body={body} />
          <div className="mt-5 border-t border-white/10 pt-3">
            <Link href={replyHref} className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#D9A6B5] hover:text-white">
              Reply
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function MessageBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const quoteLines = [];
  let index = 0;

  while (index < lines.length && lines[index].trim().startsWith(">")) {
    quoteLines.push(lines[index].replace(/^>\s?/, ""));
    index += 1;
  }

  while (index < lines.length && !lines[index].trim()) index += 1;

  const remainder = lines.slice(index).join("\n");

  return (
    <div className="space-y-4">
      {quoteLines.length ? <QuotePreview author={quoteLines[0].replace(/^@/, "")} text={quoteLines.slice(1).join("\n")} /> : null}
      {remainder ? <p className="whitespace-pre-wrap text-sm leading-7 text-[#F8F1F3]">{remainder}</p> : null}
    </div>
  );
}

function QuotePreview({ author, text }: { author: string; text: string }) {
  return (
    <blockquote className="mb-4 border-l-2 border-[#D9A6B5]/60 bg-[#362B32]/55 px-4 py-3 text-sm leading-6 text-[#CBBCC2]">
      <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#D9A6B5]">@{author}</div>
      <p className="line-clamp-4 whitespace-pre-wrap">{text}</p>
    </blockquote>
  );
}

function ProfileLink({ username }: { username?: string | null }) {
  if (!username) return <span className="text-sm font-extrabold text-white">Fizzed user</span>;
  return (
    <Link href={`/profile/${username}`} className="text-sm font-extrabold text-white hover:text-[#D9A6B5]">
      @{username}
    </Link>
  );
}

function ProfileAvatar({ username, avatarUrl }: { username?: string | null; avatarUrl?: string | null }) {
  const fallback = username?.slice(0, 2).toUpperCase() || "F";
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-xs font-black text-[#4A3B43]">
      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : fallback}
    </div>
  );
}

function StatusMessage({ message }: { message: string }) {
  const schemaMissing = message.includes("discussion_posts") || message.includes("discussion_replies") || message.includes("schema cache");
  const displayMessage = schemaMissing ? "Discussion tables are not installed in Supabase yet. Run supabase/discussion_schema.sql in the SQL editor, then try again." : message;

  return <div className="rounded border border-[#E8C879]/30 bg-[#E8C879]/10 px-4 py-3 text-sm font-bold text-[#F6DE9F]">{displayMessage}</div>;
}
