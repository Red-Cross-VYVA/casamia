-- Apply this migration in Supabase SQL Editor for existing CasaMia projects.
-- The complete schema.sql also includes this table for new environments.

create table if not exists public.proposals (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'Draft',
  public_token text not null unique,
  customer_name text,
  customer_email text,
  customer_phone text,
  selected_plan text,
  total_estimate numeric not null default 0,
  payload_json jsonb not null default '{}'::jsonb
);

create index if not exists proposals_updated_at_idx
  on public.proposals (updated_at desc);

create index if not exists proposals_status_idx
  on public.proposals (status);

alter table public.proposals enable row level security;
