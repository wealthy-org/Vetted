-- Vetted database schema (Postgres / Neon)
-- Run this against your Neon database once DATABASE_URL is set.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists kols (
  id uuid primary key default gen_random_uuid(),
  x_username text unique not null,
  display_name text,
  added_at timestamptz not null default now()
);

create table if not exists tokens (
  address text primary key,
  chain text not null,
  name text,
  symbol text,
  liquidity numeric,
  tax_buy numeric,
  tax_sell numeric,
  holder_count integer,
  risk_score integer,
  is_honeypot boolean default false,
  category text,
  price_usd numeric,
  volume_24h numeric,
  last_updated timestamptz not null default now()
);

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  kol_id uuid references kols(id) on delete cascade,
  token_address text references tokens(address) on delete cascade,
  chain text not null,
  tweet_url text,
  tweet_text text,
  called_at timestamptz not null default now(),
  price_at_call numeric,
  market_cap_at_call numeric
);

create table if not exists kol_stats (
  kol_id uuid primary key references kols(id) on delete cascade,
  win_rate numeric,
  avg_return numeric,
  total_calls integer default 0,
  updated_at timestamptz not null default now()
);

create table if not exists smart_wallets (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  chain text not null,
  label text,
  win_rate_estimate numeric,
  unique (address, chain)
);

create table if not exists wallet_activities (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references smart_wallets(id) on delete cascade,
  token_address text references tokens(address) on delete cascade,
  action text check (action in ('buy', 'sell')),
  amount numeric,
  price_at_tx numeric,
  tx_at timestamptz not null default now()
);

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token_address text references tokens(address) on delete cascade,
  added_at timestamptz not null default now(),
  unique (user_id, token_address)
);

create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  token_address text references tokens(address) on delete cascade,
  price_usd numeric,
  volume_24h numeric,
  liquidity numeric,
  snapshot_at timestamptz not null default now()
);

create table if not exists narratives (
  id uuid primary key default gen_random_uuid(),
  tag text not null,
  token_count integer default 0,
  total_volume numeric,
  week_start date not null,
  unique (tag, week_start)
);

create index if not exists idx_calls_token on calls(token_address);
create index if not exists idx_calls_kol on calls(kol_id);
create index if not exists idx_wallet_activities_token on wallet_activities(token_address);
create index if not exists idx_watchlist_user on watchlist(user_id);
create index if not exists idx_price_snapshots_token_time on price_snapshots(token_address, snapshot_at);
