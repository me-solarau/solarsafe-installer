-- =============================================================================
-- Marketing leads — demo requests captured from the public marketing site.
--
-- This is NOT job evidence: it lives outside the company evidence firewall and
-- is intentionally separate from the stage-gate schema. RLS is enabled with NO
-- policies for anon/authenticated roles, so the table is unreadable and
-- unwritable through the public API. The Next.js /api/leads route writes to it
-- server-side using the service-role key, which bypasses RLS.
-- =============================================================================

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  crews text,
  notes text,
  -- attribution
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referer text,
  -- lightweight lifecycle for sales follow-up
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_email_idx on leads (email);
create index if not exists leads_status_idx on leads (status);

-- Lock it down. No policies = deny-all for anon and authenticated; the
-- service-role key used by the server route bypasses RLS to insert.
alter table leads enable row level security;
