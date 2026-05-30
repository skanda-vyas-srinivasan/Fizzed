create policy "Users create own profile" on public.profiles
for insert
with check (auth.uid() = id);
