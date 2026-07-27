-- =============================================================================
-- Marketing "Book a demo" requests from the Solarsafe Installer marketing site.
--
-- Deployed to the Solarsearch Supabase project. Deliberately a SEPARATE table
-- from that project's existing consumer `leads` table (the B2C homeowner
-- pipeline, whose rows require site_id + customer_id). These are B2B product
-- demo requests from retailers and must not mix with that pipeline.
--
-- RLS enabled with NO policies for anon/authenticated: unreadable and
-- unwritable through the public API. The Next.js /api/leads route writes here
-- server-side using the service-role key, which bypasses RLS.
-- =============================================================================

create table if not exists public.demo_requests (
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

create index if not exists demo_requests_created_at_idx on public.demo_requests (created_at desc);
create index if not exists demo_requests_email_idx on public.demo_requests (email);
create index if not exists demo_requests_status_idx on public.demo_requests (status);

-- Lock it down. No policies = deny-all for anon and authenticated; the
-- service-role key used by the server route bypasses RLS to insert.
alter table public.demo_requests enable row level security;
