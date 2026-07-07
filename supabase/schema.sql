-- Metrixa: schema inicial

-- Tabla de clientes/usuarios
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  plan text default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now()
);

-- Tabla de tokens de Meta Ads por cliente
create table if not exists meta_tokens (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  access_token text not null,
  ad_account_id text not null,
  account_name text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de snapshots / historial de métricas
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  score integer not null,
  metrics jsonb not null,
  campaigns jsonb not null,
  is_real_data boolean default false,
  source text default 'csv' check (source in ('csv', 'meta_api')),
  created_at timestamptz default now()
);

-- RLS (Row Level Security) — cada cliente solo ve sus propios datos
alter table clients enable row level security;
alter table meta_tokens enable row level security;
alter table snapshots enable row level security;

-- Políticas: acceso solo para service_role (backend). Anon key no puede leer/escribir.
-- Cuando se agregue Supabase Auth, cambiar a: using (auth.uid() = user_id)
create policy "clients_deny_anon" on clients for all using (auth.role() = 'service_role');
create policy "tokens_deny_anon" on meta_tokens for all using (auth.role() = 'service_role');
create policy "snapshots_deny_anon" on snapshots for all using (auth.role() = 'service_role');
