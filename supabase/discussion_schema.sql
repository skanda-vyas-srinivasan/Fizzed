create table if not exists public.discussion_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  body text not null check (char_length(body) between 4 and 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists discussion_posts_created_idx on public.discussion_posts (created_at desc);
create index if not exists discussion_replies_post_idx on public.discussion_replies (post_id, created_at asc);

alter table public.discussion_posts enable row level security;
alter table public.discussion_replies enable row level security;

create policy "Discussion posts are public" on public.discussion_posts for select using (true);
create policy "Users create own discussion posts" on public.discussion_posts for insert with check (auth.uid() = user_id);
create policy "Users update own discussion posts" on public.discussion_posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own discussion posts" on public.discussion_posts for delete using (auth.uid() = user_id);

create policy "Discussion replies are public" on public.discussion_replies for select using (true);
create policy "Users create own discussion replies" on public.discussion_replies for insert with check (auth.uid() = user_id);
create policy "Users update own discussion replies" on public.discussion_replies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own discussion replies" on public.discussion_replies for delete using (auth.uid() = user_id);
