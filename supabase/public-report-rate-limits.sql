-- Apply once in Supabase SQL Editor for existing CasaMia projects.
-- It replaces process-local report throttling with a serverless-safe reservation.

create table if not exists public.public_request_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  reservation_count integer not null default 1
);

create index if not exists public_request_rate_limits_window_started_at_idx
  on public.public_request_rate_limits (window_started_at);

create or replace function public.reserve_public_request(
  p_key_hash text,
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
  if p_key_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_window_seconds < 60 or p_window_seconds > 86400 then
    return false;
  end if;

  window_length := make_interval(secs => p_window_seconds);

  delete from public.public_request_rate_limits
  where window_started_at < now() - interval '2 days';

  insert into public.public_request_rate_limits (key_hash, window_started_at, reservation_count)
  values (p_key_hash, now(), 1)
  on conflict (key_hash) do update set
    window_started_at = case
      when public_request_rate_limits.window_started_at <= now() - window_length then now()
      else public_request_rate_limits.window_started_at
    end,
    reservation_count = case
      when public_request_rate_limits.window_started_at <= now() - window_length then 1
      else least(public_request_rate_limits.reservation_count + 1, p_limit + 1)
    end
  returning reservation_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.reserve_public_request(text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_public_request(text, integer, integer) to service_role;

alter table public.public_request_rate_limits enable row level security;
