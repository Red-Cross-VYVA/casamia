create table if not exists public.assessment_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  type text,
  status text not null default 'New',
  customer_name text,
  customer_email text,
  customer_phone text,
  city_area text,
  preferred_contact_method text,
  preferred_assessment_date text,
  selected_plan text,
  consent_at timestamptz,
  source text,
  message text,
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  type text,
  status text not null default 'New',
  customer_name text,
  customer_email text,
  customer_phone text,
  selected_plan text,
  source text,
  message text,
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists public.provider_applications (
  id uuid primary key default gen_random_uuid(),
  application_id text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'new',
  business_name text,
  contact_name text,
  email text,
  phone text,
  website text,
  cities text[] not null default '{}',
  trades text[] not null default '{}',
  experience text,
  availability text,
  insurance_confirmed boolean not null default false,
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists public.consent_evidence (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  customer_reference text,
  consent_type text not null,
  wording text not null,
  wording_version text not null,
  terms_version text,
  project_order_version text,
  withdrawal_version text,
  locale text,
  contract_language text,
  channel text,
  timestamp timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  customer_name text,
  order_reference text,
  installation_address text,
  contact text,
  order_date date,
  submission_date date,
  comments text,
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'New',
  plan_id text,
  plan_label text,
  plan_price text,
  installation_address text,
  city text,
  postcode text,
  province text,
  customer_name text,
  customer_phone text,
  customer_email text,
  preferred_timing text,
  notes text,
  payment_method text,
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists public.service_catalogue (
  id text primary key default 'default',
  updated_at timestamptz not null default now(),
  updated_by text,
  payload_json jsonb not null default '{"services":[]}'::jsonb
);

alter table public.assessment_requests enable row level security;
alter table public.contact_requests enable row level security;
alter table public.provider_applications enable row level security;
alter table public.consent_evidence enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.orders enable row level security;
alter table public.service_catalogue enable row level security;
