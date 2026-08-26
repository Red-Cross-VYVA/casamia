-- Apply once in Supabase SQL Editor for existing CasaMia projects.
-- The canonical schema.sql includes the same tables for new environments.

create table if not exists public.agreement_assignments (
  id uuid primary key default gen_random_uuid(),
  assignment_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  document_id text not null,
  document_version text not null,
  locale text not null default 'es',
  status text not null default 'draft',
  partner_id text,
  partner_business_name text,
  partner_contact_name text,
  partner_email text,
  assigned_at timestamptz not null default now(),
  assigned_by text,
  expires_at timestamptz,
  share_enabled boolean not null default false,
  share_token_hash text unique,
  share_last_created_at timestamptz,
  signature_status text not null default 'not-started',
  signed_at timestamptz,
  payload_json jsonb not null default '{}'::jsonb
);

create index if not exists agreement_assignments_updated_at_idx
  on public.agreement_assignments (updated_at desc);

create index if not exists agreement_assignments_status_idx
  on public.agreement_assignments (status);

create index if not exists agreement_assignments_partner_email_idx
  on public.agreement_assignments (partner_email);

create table if not exists public.agreement_audit_events (
  id uuid primary key default gen_random_uuid(),
  assignment_id text not null,
  created_at timestamptz not null default now(),
  event_type text not null,
  actor_type text,
  actor_label text,
  metadata_json jsonb not null default '{}'::jsonb
);

create index if not exists agreement_audit_events_assignment_idx
  on public.agreement_audit_events (assignment_id, created_at desc);

alter table public.agreement_assignments enable row level security;
alter table public.agreement_audit_events enable row level security;
