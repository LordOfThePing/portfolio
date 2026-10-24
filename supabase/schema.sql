-- ============================================================================
--  Linktree backend — run this once in Supabase.
--  Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
--  Safe to re-run: everything uses "if not exists" / "or replace".
-- ============================================================================

-- 1) Append-only event log powering the /links Stats page.
--    One row per visit or click. No locking, no race conditions — just inserts.
create table if not exists public.link_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  kind        text        not null check (kind in ('visit', 'click')),
  link_id     text,                     -- set for clicks, null for visits
  first_visit boolean     not null default false  -- true only on a device's first visit
);

-- Which custom list the event came from (/links/<list>). Null = the Default
-- list (/links) or a direct /links/<id> share.
alter table public.link_events add column if not exists list_id text;

create index if not exists link_events_created_at_idx on public.link_events (created_at);
create index if not exists link_events_kind_idx        on public.link_events (kind);

-- 2) The editable /admin/config document, stored as a single JSONB row.
create table if not exists public.link_config (
  id         int         primary key default 1,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  constraint link_config_single_row check (id = 1)
);

-- 3) Aggregation the Stats page calls. Returns one row per metric:
--    'visits', 'visitors', and 'click:<link_id>' — matching the app's counter
--    keys exactly, so the dashboard code stays unchanged.
--    [from_ts, to_ts) is a half-open interval (from inclusive, to exclusive).
--    _list: null = every list combined, 'default' = the Default list only,
--    otherwise that custom list's id.
--    (The drop removes the older two-argument version, which would otherwise
--    stay behind as an overload.)
drop function if exists public.link_metrics(timestamptz, timestamptz);
create or replace function public.link_metrics(
  from_ts timestamptz,
  to_ts   timestamptz,
  _list   text default null
)
returns table (metric text, count bigint)
language sql
stable
as $$
  with e as (
    select kind, link_id, first_visit
    from public.link_events
    where created_at >= from_ts and created_at < to_ts
      and (_list is null or coalesce(list_id, 'default') = _list)
  )
  select 'visits'::text, count(*)::bigint
  from e
  where kind = 'visit'
  union all
  select 'visitors', count(*)
  from e
  where kind = 'visit' and first_visit
  union all
  select 'click:' || link_id, count(*)
  from e
  where kind = 'click' and link_id is not null
  group by link_id;
$$;

-- 4) Lock it all down. The app connects only from the server using the SERVICE
--    ROLE key, which bypasses RLS. Enabling RLS with no policies means the
--    public anon key can neither read nor write — so even a leaked anon key
--    can't touch your stats or config.
alter table public.link_events enable row level security;
alter table public.link_config enable row level security;

-- ============================================================================
--  5) Blog — Markdown posts, edited at /admin/blog.
--     visibility: 'public'  -> listed on /blog and rendered at /blog/<slug>.
--                 'private' -> NOT listed anywhere; rendered only at the
--                              secret path /blog/p/<token>. Handy for sharing
--                              a single job proposal or draft with a link.
--     Every post gets a random 32-char 'token' for private sharing; public
--     posts simply never expose theirs.
-- ============================================================================
create table if not exists public.blog_posts (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,       -- url path, e.g. 'my-first-post'
  title       text        not null,
  excerpt     text        not null default '',   -- shown on the /blog index
  visibility  text        not null default 'public' check (visibility in ('public','private')),
  token       text        not null,              -- secret share key (random)
  body_md     text        not null default '',   -- markdown source
  published_at timestamptz,                      -- null until published
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists blog_posts_public_idx on public.blog_posts (visibility, published_at desc);

-- Best-effort read helpers (the app reads directly through the service role,
-- but these keep queries consistent and row-limited).
create or replace function public.list_blog_posts(_max int default 100)
returns table (id bigint, slug text, title text, excerpt text, visibility text, published_at timestamptz)
language sql
stable
as $$
  select id, slug, title, excerpt, visibility, published_at
  from public.blog_posts
  where visibility = 'public' and published_at is not null
  order by published_at desc
  limit _max;
$$;

alter table public.blog_posts enable row level security;

-- ============================================================================
--  6) Profile photos uploaded from /admin/config (Default and custom lists).
--     Public bucket: a photo is readable by URL (it's on /links anyway). Writes
--     only happen server-side with the service role — no storage policies grant
--     anon/authenticated writes, so the public key can't upload or delete.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
