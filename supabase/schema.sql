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
create or replace function public.link_metrics(from_ts timestamptz, to_ts timestamptz)
returns table (metric text, count bigint)
language sql
stable
as $$
  select 'visits'::text, count(*)::bigint
  from public.link_events
  where kind = 'visit' and created_at >= from_ts and created_at < to_ts
  union all
  select 'visitors', count(*)
  from public.link_events
  where kind = 'visit' and first_visit and created_at >= from_ts and created_at < to_ts
  union all
  select 'click:' || link_id, count(*)
  from public.link_events
  where kind = 'click' and link_id is not null
    and created_at >= from_ts and created_at < to_ts
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
