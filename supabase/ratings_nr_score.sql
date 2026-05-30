alter table public.ratings
  alter column score drop not null;

alter table public.ratings
  drop constraint if exists ratings_score_check;

alter table public.ratings
  add constraint ratings_score_check check (score is null or score between 1 and 5);

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

update public.sodas s
set
  avg_rating = coalesce((select round(avg(r.score)::numeric, 2) from public.ratings r where r.soda_id = s.id and r.score is not null), 0),
  total_ratings = coalesce((select count(r.score) from public.ratings r where r.soda_id = s.id), 0);
