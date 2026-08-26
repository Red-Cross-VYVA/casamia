-- Apply once in Supabase SQL Editor for existing CasaMia projects.
-- It is idempotent and aligns existing storage with supabase/schema.sql.

create index if not exists wizard_media_rate_limits_window_started_at_idx
  on public.wizard_media_rate_limits (window_started_at);

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

  delete from public.wizard_media_rate_limits
  where window_started_at < now() - interval '2 days';

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
(
  'wizard-audio',
  'wizard-audio',
  false,
  26214400,
  array['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a']::text[]
),
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
