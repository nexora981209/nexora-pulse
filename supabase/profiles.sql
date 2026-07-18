-- Tabla de perfiles de usuario con plan
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text not null default 'free' check (plan in ('free','starter','pro','agency')),
  created_at timestamptz default now()
);

-- Se crea automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

-- Usuarios pueden leer su propio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Usuarios solo pueden actualizar email (NO plan)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and plan = (select plan from public.profiles where id = auth.uid())
  );

-- Solo admin puede leer todos los perfiles
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
  for select using (
    auth.jwt() ->> 'email' = 'nexora981209@gmail.com'
  );

-- Solo admin puede actualizar el plan de cualquier usuario
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (
    auth.jwt() ->> 'email' = 'nexora981209@gmail.com'
  );
