alter table public.sodas
  add column if not exists source text not null default 'open_food_facts',
  add column if not exists source_url text,
  add column if not exists source_page_id text,
  add column if not exists source_payload jsonb not null default '{}'::jsonb;

create index if not exists sodas_source_idx on public.sodas (source);
create index if not exists sodas_source_page_idx on public.sodas (source, source_page_id);
