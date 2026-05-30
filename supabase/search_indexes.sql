create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_search_idx on public.profiles using gin (
  to_tsvector('simple', coalesce(username, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(location, ''))
);
