create table if not exists public.soda_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.soda_list_items (
  list_id uuid not null references public.soda_lists(id) on delete cascade,
  soda_id uuid not null references public.sodas(id) on delete cascade,
  position integer not null default 0,
  note text default '',
  created_at timestamptz not null default now(),
  primary key (list_id, soda_id)
);

create index if not exists soda_lists_created_idx on public.soda_lists (created_at desc);
create index if not exists soda_list_items_list_idx on public.soda_list_items (list_id, position asc);

alter table public.soda_lists enable row level security;
alter table public.soda_list_items enable row level security;

create policy "Soda lists are public" on public.soda_lists for select using (true);
create policy "Users create own soda lists" on public.soda_lists for insert with check (auth.uid() = user_id);
create policy "Users update own soda lists" on public.soda_lists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own soda lists" on public.soda_lists for delete using (auth.uid() = user_id);

create policy "Soda list items are public" on public.soda_list_items for select using (true);
create policy "Users create items in own lists" on public.soda_list_items
  for insert with check (
    exists (
      select 1 from public.soda_lists
      where soda_lists.id = soda_list_items.list_id
      and soda_lists.user_id = auth.uid()
    )
  );
create policy "Users update items in own lists" on public.soda_list_items
  for update using (
    exists (
      select 1 from public.soda_lists
      where soda_lists.id = soda_list_items.list_id
      and soda_lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.soda_lists
      where soda_lists.id = soda_list_items.list_id
      and soda_lists.user_id = auth.uid()
    )
  );
create policy "Users delete items in own lists" on public.soda_list_items
  for delete using (
    exists (
      select 1 from public.soda_lists
      where soda_lists.id = soda_list_items.list_id
      and soda_lists.user_id = auth.uid()
    )
  );
