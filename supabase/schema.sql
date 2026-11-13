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
-- anywhere said why. Then `email_log.purpose` turned out to carry a CHECK list
-- that did not include the purposes the code logs, so every send went unrecorded
-- for the same reason: the column existed, the value was refused, the error was
-- dropped. A schema that lives only in a migration tool nobody reads drifts; a
-- schema in the repo gets checked on every build -- columns and values both.
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

-- Domains the database enforces. These matter as much as the columns: a CHECK
-- the code does not know about rejects the row, and a rejected insert that
-- nobody reads looks exactly like a table nobody ever writes to.
--
-- email_log.purpose is the one that broke. It allowed only 'form_notice',
-- 'welcome', 'publish_notice' and 'broadcast' while lib/email.ts logged six
-- other purposes, so every log insert was rejected (23514), the error was
-- discarded, and the log stayed empty through two real enquiries and every
-- sign-in code. The list below is exactly the TemplateSlug union in
-- lib/email.ts, and qa/schema-contract.mjs fails the build if the two drift
-- apart in either direction.
alter table public.email_log drop constraint if exists email_log_purpose_check;
alter table public.email_log add constraint email_log_purpose_check check (purpose in (
  'owner_forward', 'ack', 'welcome', 'publish_notice',
  'broadcast_newsletter', 'broadcast_new_work', 'broadcast_offer', 'admin_code'
));

alter table public.email_log drop constraint if exists email_log_status_check;
alter table public.email_log add constraint email_log_status_check check (status in ('queued', 'sent', 'failed'));

alter table public.email_templates drop constraint if exists email_templates_sender_check;
alter table public.email_templates add constraint email_templates_sender_check check (sender in ('hello', 'enquiries'));

alter table public.site_singletons drop constraint if exists site_singletons_key_check;
alter table public.site_singletons add constraint site_singletons_key_check check (key in ('profile', 'now', 'settings', 'revisions'));

alter table public.subscribers drop constraint if exists subscribers_status_check;
alter table public.subscribers add constraint subscribers_status_check check (status in ('active', 'unsubscribed'));

-- Indexes the queries actually rely on. The unique one on subscribers is what
-- makes "one row per address, whatever the capitalisation" true; addSubscriber()
-- reads before it writes and updates rather than inserting a second row.
create unique index if not exists subscribers_email_idx on public.subscribers (lower(email));
create index if not exists subscribers_status_idx on public.subscribers (status);
create index if not exists email_log_created_idx  on public.email_log (created_at desc);
create index if not exists enquiries_created_idx  on public.enquiries (created_at desc);
create index if not exists site_content_collection_idx on public.site_content (collection);

alter table public.site_content    enable row level security;
alter table public.site_singletons enable row level security;
alter table public.enquiries       enable row level security;
alter table public.subscribers     enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_log       enable row level security;
alter table public.admin_signins   enable row level security;
