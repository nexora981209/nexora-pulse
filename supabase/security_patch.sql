-- SECURITY PATCH: run this in Supabase SQL Editor
-- Fixes: users could update their own plan (free -> agency) via Supabase client directly

-- Drop old permissive policy
drop policy if exists "profiles_own" on public.profiles;

-- SELECT: own row only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- UPDATE: own row, but plan column cannot be changed by the user
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and plan = (select plan from public.profiles where id = auth.uid())
  );

-- Admin: read all profiles
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
  for select using (
    auth.jwt() ->> 'email' = 'nexora981209@gmail.com'
  );

-- Admin: update any profile (including plan)
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (
    auth.jwt() ->> 'email' = 'nexora981209@gmail.com'
  );
