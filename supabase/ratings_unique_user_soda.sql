-- Run after you are comfortable deduplicating old accidental duplicate ratings.
-- Keeps the newest rating for each user/soda pair, then enforces one rating per user per soda.

delete from public.ratings r
using public.ratings newer
where r.user_id = newer.user_id
  and r.soda_id = newer.soda_id
  and r.created_at < newer.created_at;

create unique index if not exists ratings_one_per_user_soda_idx
on public.ratings (user_id, soda_id);
