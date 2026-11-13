-- TIMFIRE — the shape of the production database.
--
-- This file is the record the code is checked against (qa/schema-contract.mjs).
-- The live database in Supabase (project fohuipnryszzqmgrmofn) is the source of
-- truth; this file must match it. It is written so it can be run against an
-- empty database to rebuild the same shape, and against the live one to top up
-- anything missing without touching the data already there.
--
-- Why it exists: `subscribers.name` was missing from the live table while the
-- code wrote it, so every subscription silently failed with a 503 and nothing
-- anywhere said why. A schema that lives only in a migration tool nobody reads
-- drifts; a schema in the repo gets checked on every build.
--
-- Row Level Security is on for every table with no policies at all: the only
-- way in is the service-role key, held server-side in SUPABASE_SERVICE_ROLE_KEY.

create table if not exists public.site_content (
  collection text not null,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create table if not exists public.site_singletons (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,
  name       text not null,
  email      text not null,
  answers    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  status          text not null default 'active',
  source          text not null default 'site',
  unsub_token     uuid not null default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz,
  name            text not null default ''
);
comment on column public.subscribers.name is
  'The name every email greets the subscriber with. The site never sends a nameless mail.';

create table if not exists public.email_templates (
  slug       text primary key,
  purpose    text not null,
  sender     text not null,
  subject    text not null,
  body       text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  purpose    text not null,
  recipient  text not null,
  subject    text not null,
  resend_id  text,
  status     text not null default 'queued',
  error      text,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_signins (
  key        text primary key,
  email      text,
  code_hash  text,
  tries      smallint not null default 0,
  tally      smallint not null default 0,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
comment on table public.admin_signins is
  'Sign-in state for the single-owner dashboard: the pending emailed code and the rate-limit windows. Lives in the database because serverless instances do not share process memory.';
comment on column public.admin_signins.key is
  'code = the pending emailed code; pw:<ip> = failed-password window; req:<ip> = code-request window.';
comment on column public.admin_signins.code_hash is
  'sha256 of the six-digit code. The code itself is never stored.';

-- Top up columns on a database created before they existed.
alter table public.subscribers add column if not exists name text not null default '';

alter table public.site_content    enable row level security;
alter table public.site_singletons enable row level security;
alter table public.enquiries       enable row level security;
alter table public.subscribers     enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_log       enable row level security;
alter table public.admin_signins   enable row level security;
