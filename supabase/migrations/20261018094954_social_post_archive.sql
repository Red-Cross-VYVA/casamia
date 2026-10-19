-- Private publication history, accessed only by the authenticated server API.
create table if not exists public.social_post_archive (
  id text primary key,
  account_id text not null,
  platform text not null check (platform in ('facebook', 'instagram')),
  source_post_id text not null default '',
  title text not null,
  language text not null default '',
  image_path text not null default '',
  image_url text not null default '',
  caption text not null,
  status text not null check (status in ('publishing', 'published', 'failed')),
  external_post_id text not null default '',
  post_url text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  result_json jsonb not null default '{}'::jsonb
);

create index if not exists social_post_archive_published_idx
  on public.social_post_archive (account_id, published_at desc, id)
  where status = 'published';
create index if not exists social_post_archive_source_idx
  on public.social_post_archive (account_id, platform, source_post_id);

alter table public.social_post_archive enable row level security;
revoke all on public.social_post_archive from anon, authenticated;
grant select, insert, update on public.social_post_archive to service_role;
