create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  bio text default '',
  location text default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-zA-Z0-9_]{3,24}$')
);

create table if not exists public.sodas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null default 'Unknown',
  country text not null default 'Unknown',
  category text not null default 'Soda',
  flavor_tags text[] not null default '{}',
  image_url text,
  avg_rating numeric(3,2) not null default 0,
  total_ratings integer not null default 0,
  created_at timestamptz not null default now(),
  constraint sodas_unique_product unique (name, brand, country)
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  soda_id uuid not null references public.sodas(id) on delete cascade,
  score integer check (score between 1 and 5),
  review_text text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index if not exists sodas_name_idx on public.sodas using gin (to_tsvector('simple', name || ' ' || brand));
create index if not exists sodas_brand_idx on public.sodas (brand);
create index if not exists sodas_country_idx on public.sodas (country);
create index if not exists ratings_soda_idx on public.ratings (soda_id, created_at desc);
create index if not exists ratings_user_idx on public.ratings (user_id, created_at desc);

create or replace function public.refresh_soda_rating_stats(target_soda_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.sodas
  set
    avg_rating = coalesce((select round(avg(score)::numeric, 2) from public.ratings where soda_id = target_soda_id and score is not null), 0),
    total_ratings = coalesce((select count(score) from public.ratings where soda_id = target_soda_id), 0)
  where id = target_soda_id;
end;
$$;

create or replace function public.handle_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_soda_rating_stats(old.soda_id);
    return old;
  end if;

  perform public.refresh_soda_rating_stats(new.soda_id);
  return new;
end;
$$;

drop trigger if exists ratings_stats_insert on public.ratings;
create trigger ratings_stats_insert
after insert on public.ratings
for each row execute function public.handle_rating_stats();

drop trigger if exists ratings_stats_update on public.ratings;
create trigger ratings_stats_update
after update of score, soda_id on public.ratings
for each row execute function public.handle_rating_stats();

drop trigger if exists ratings_stats_delete on public.ratings;
create trigger ratings_stats_delete
after delete on public.ratings
for each row execute function public.handle_rating_stats();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'username', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sodas enable row level security;
alter table public.ratings enable row level security;
alter table public.follows enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users create own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Sodas are public" on public.sodas for select using (true);
create policy "Ratings are public" on public.ratings for select using (true);
create policy "Users create own ratings" on public.ratings for insert with check (auth.uid() = user_id);
create policy "Users update own ratings" on public.ratings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own ratings" on public.ratings for delete using (auth.uid() = user_id);
create policy "Follows are public" on public.follows for select using (true);
create policy "Users create own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users delete own follows" on public.follows for delete using (auth.uid() = follower_id);
