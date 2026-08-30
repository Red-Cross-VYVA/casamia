create table if not exists public.customer_crm_records (
  customer_key text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner text not null default '',
  lifecycle_status text not null default 'New',
  internal_notes text not null default '',
  next_action text not null default '',
  next_action_due_at timestamptz
);

create index if not exists customer_crm_records_due_at_idx
  on public.customer_crm_records (next_action_due_at)
  where next_action <> '';

create index if not exists customer_crm_records_status_idx
  on public.customer_crm_records (lifecycle_status);

