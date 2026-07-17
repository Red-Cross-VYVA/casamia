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

create table if not exists public.wizard_media_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  reservation_count integer not null default 1
);

create table if not exists public.wizard_voice_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  reservation_count integer not null default 1
);

create table if not exists public.callback_request_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  reservation_count integer not null default 1
);

create index if not exists wizard_voice_rate_limits_window_started_at_idx
  on public.wizard_voice_rate_limits (window_started_at);

create index if not exists callback_request_rate_limits_window_started_at_idx
  on public.callback_request_rate_limits (window_started_at);

create or replace function public.reserve_wizard_media_upload(
  p_ip_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  window_length interval;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_window_seconds < 60 or p_window_seconds > 86400 then
    return false;
  end if;

  window_length := make_interval(secs => p_window_seconds);

  insert into public.wizard_media_rate_limits (ip_hash, window_started_at, reservation_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    window_started_at = case
      when wizard_media_rate_limits.window_started_at <= now() - window_length then now()
      else wizard_media_rate_limits.window_started_at
    end,
    reservation_count = case
      when wizard_media_rate_limits.window_started_at <= now() - window_length then 1
      else least(wizard_media_rate_limits.reservation_count + 1, p_limit + 1)
    end
  returning reservation_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.reserve_wizard_media_upload(text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_wizard_media_upload(text, integer, integer) to service_role;

create or replace function public.reserve_wizard_voice_session(
  p_ip_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  window_length interval;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_window_seconds < 60 or p_window_seconds > 86400 then
    return false;
  end if;

  window_length := make_interval(secs => p_window_seconds);

  -- Keep anonymous rate-limit data short-lived. The index above makes this
  -- opportunistic cleanup cheap as the table grows.
  delete from public.wizard_voice_rate_limits
  where window_started_at < now() - interval '2 days';

  insert into public.wizard_voice_rate_limits (ip_hash, window_started_at, reservation_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    window_started_at = case
      when wizard_voice_rate_limits.window_started_at <= now() - window_length then now()
      else wizard_voice_rate_limits.window_started_at
    end,
    reservation_count = case
      when wizard_voice_rate_limits.window_started_at <= now() - window_length then 1
      else least(wizard_voice_rate_limits.reservation_count + 1, p_limit + 1)
    end
  returning reservation_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.reserve_wizard_voice_session(text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_wizard_voice_session(text, integer, integer) to service_role;

create or replace function public.release_wizard_voice_session(p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$' then
    return;
  end if;

  update public.wizard_voice_rate_limits
  set reservation_count = greatest(reservation_count - 1, 0)
  where ip_hash = p_ip_hash;
end;
$$;

revoke all on function public.release_wizard_voice_session(text) from public, anon, authenticated;
grant execute on function public.release_wizard_voice_session(text) to service_role;

create or replace function public.reserve_callback_request(
  p_ip_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  window_length interval;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_window_seconds < 60 or p_window_seconds > 86400 then
    return false;
  end if;

  window_length := make_interval(secs => p_window_seconds);

  delete from public.callback_request_rate_limits
  where window_started_at < now() - interval '2 days';

  insert into public.callback_request_rate_limits (ip_hash, window_started_at, reservation_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    window_started_at = case
      when callback_request_rate_limits.window_started_at <= now() - window_length then now()
      else callback_request_rate_limits.window_started_at
    end,
    reservation_count = case
      when callback_request_rate_limits.window_started_at <= now() - window_length then 1
      else least(callback_request_rate_limits.reservation_count + 1, p_limit + 1)
    end
  returning reservation_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.reserve_callback_request(text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_callback_request(text, integer, integer) to service_role;

create or replace function public.release_callback_request(p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$' then
    return;
  end if;

  update public.callback_request_rate_limits
  set reservation_count = greatest(reservation_count - 1, 0)
  where ip_hash = p_ip_hash;
end;
$$;

revoke all on function public.release_callback_request(text) from public, anon, authenticated;
grant execute on function public.release_callback_request(text) to service_role;

-- Private media uploaded with home-safety wizard assessments. Object paths are
-- server-generated and stored in assessment_requests.payload_json. Do not add a
-- public storage.objects read policy for this bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
(
  'wizard-images',
  'wizard-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
),
(
  'wizard-videos',
  'wizard-videos',
  false,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.assessment_requests enable row level security;
alter table public.contact_requests enable row level security;
alter table public.provider_applications enable row level security;
alter table public.consent_evidence enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.orders enable row level security;
alter table public.service_catalogue enable row level security;
alter table public.wizard_media_rate_limits enable row level security;
alter table public.wizard_voice_rate_limits enable row level security;
alter table public.callback_request_rate_limits enable row level security;
