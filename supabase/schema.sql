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

-- Políticas básicas (ajustar cuando agregues auth)
create policy "clients_own" on clients for all using (true);
create policy "tokens_own" on meta_tokens for all using (true);
create policy "snapshots_own" on snapshots for all using (true);
