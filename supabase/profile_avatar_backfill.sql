update public.profiles
set avatar_url = coalesce(auth.users.raw_user_meta_data->>'avatar_url', auth.users.raw_user_meta_data->>'picture')
from auth.users
where public.profiles.id = auth.users.id
  and public.profiles.avatar_url is null
  and coalesce(auth.users.raw_user_meta_data->>'avatar_url', auth.users.raw_user_meta_data->>'picture') is not null;
