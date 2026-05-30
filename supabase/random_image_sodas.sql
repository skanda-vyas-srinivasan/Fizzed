create or replace function public.random_image_sodas(result_limit integer default 24)
returns setof public.sodas
language sql
stable
as $$
  select *
  from public.sodas
  where country = 'Global'
    and image_url is not null
  order by random()
  limit result_limit;
$$;
