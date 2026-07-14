-- Core schema — Solarsafe Installer
-- Tables per solarsafe-installer-build-kickoff.md "Core schema (first migration set)".

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.qualification_type as enum ('electrical_licence', 'saa_accreditation');
create type public.qualification_verification_status as enum ('unverified', 'verified', 'expired', 'lapsed');
create type public.seat_status as enum ('invited', 'active', 'deactivated');
create type public.job_lifecycle_state as enum ('created', 'populating', 'scheduled', 'install_ready', 'in_progress', 'signed_off', 'locked');
create type public.job_role as enum ('lead', 'installer');
create type public.stage_instance_status as enum ('locked', 'unlocked', 'complete');

-- Includes 'pending_review' (Phase 3: every photo auto-passes to pending review
-- before AI verification exists) alongside the four spec-defined outcomes.
create type public.verification_outcome as enum ('pending_review', 'pass', 'conditional_pass', 'fail', 'unverifiable');

-- ---------------------------------------------------------------------------
-- Companies & seats
-- ---------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subscription_state text not null default 'trialing',
  created_at timestamptz not null default now()
);

-- Maps dashboard auth users to a company. Not itemised in the kickoff doc's
-- schema list; added because the evidence firewall (rule #6) needs a way to
-- resolve auth.uid() -> company_id.
create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (company_id, auth_user_id)
);

-- Free, global installer identity — independent of any company.
create table public.installers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table public.installer_devices (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references public.installers(id) on delete cascade,
  device_label text,
  device_identifier text not null,
  bound_at timestamptz not null default now(),
  last_seen_at timestamptz,
  unique (installer_id, device_identifier)
);

create table public.qualifications (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references public.installers(id) on delete cascade,
  type public.qualification_type not null,
  scope text not null,
  number text not null,
  expiry_date date,
  verification_status public.qualification_verification_status not null default 'unverified',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- THE SEAT: an active company <-> installer link.
create table public.company_installer_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installer_id uuid not null references public.installers(id) on delete cascade,
  status public.seat_status not null default 'invited',
  consent_recorded_at timestamptz,
  consent_version text,
  billing_anchor_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, installer_id)
);

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lifecycle_state public.job_lifecycle_state not null default 'created',
  site_address text not null,
  site_gps_lat double precision,
  site_gps_lng double precision,
  nmi text,
  dnsp_reference text,
  dnsp_export_limit_w integer,
  dnsp_status text not null default 'not_applied',
  design_summary jsonb not null default '{}'::jsonb,
  rules_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_equipment (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  category text not null,
  brand text not null,
  model text not null,
  ruleset_ref text,
  created_at timestamptz not null default now()
);

create table public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  company_installer_link_id uuid not null references public.company_installer_links(id) on delete cascade,
  role public.job_role not null,
  designated_at timestamptz not null default now(),
  superseded_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Stages & captures
-- ---------------------------------------------------------------------------

-- Static reference data, Stage 0 through Stage 10. Rows inserted by
-- migration 00000000000002_seed_stages.sql.
create table public.stages (
  id smallint primary key,
  key text not null unique,
  name text not null,
  sequence smallint not null unique
);

create table public.stage_instances (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  stage_id smallint not null references public.stages(id),
  status public.stage_instance_status not null default 'locked',
  lead_confirmed_by uuid references public.installers(id),
  lead_confirmed_at timestamptz,
  unique (job_id, stage_id)
);

create table public.captures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  stage_instance_id uuid not null references public.stage_instances(id) on delete cascade,
  company_installer_link_id uuid not null references public.company_installer_links(id),
  device_id uuid references public.installer_devices(id),
  storage_ref text not null,
  sha256_hash text not null,
  gps_lat double precision,
  gps_lng double precision,
  captured_at timestamptz not null default now(),
  verification_outcome public.verification_outcome not null default 'pending_review',
  ai_response jsonb,
  clause_refs text[] not null default '{}',
  supersedes_capture_id uuid references public.captures(id),
  created_at timestamptz not null default now()
);

-- Every FAIL, preserved permanently. Admin-visible only (spec: "STC Evidence
-- & Export Layer" -> Non-compliance log). Written by the server-side AI
-- verification pipeline (service role) — see RLS migration for why there is
-- no authenticated insert/update/delete policy on this table.
create table public.noncompliance_log (
  id uuid primary key default gen_random_uuid(),
  capture_id uuid not null references public.captures(id),
  ai_response jsonb not null,
  rectification_note text not null,
  rectification_capture_id uuid references public.captures(id),
  closed_by_installer_id uuid references public.installers(id),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.panel_register (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  capture_id uuid not null references public.captures(id),
  company_installer_link_id uuid not null references public.company_installer_links(id),
  serial text not null,
  brand text not null,
  model text not null,
  is_inverter boolean not null default false,
  gps_lat double precision,
  gps_lng double precision,
  captured_at timestamptz not null default now(),
  -- Populated by the verification pipeline, not a unique constraint: a
  -- duplicate serial is a fraud signal to flag and record, not a write to reject.
  duplicate_of_panel_id uuid references public.panel_register(id)
);

-- ---------------------------------------------------------------------------
-- Lodgements, weather, supplementary media
-- ---------------------------------------------------------------------------

create table public.lodgements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  type text not null check (type in ('dnsp', 'stc', 'ccew', 'derr')),
  status text not null,
  reference text,
  evidence_ref text,
  responsible_party text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, type)
);

create table public.weather_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  recorded_hour timestamptz not null,
  temperature_c numeric,
  wind_speed_kmh numeric,
  wind_gust_kmh numeric,
  precipitation_mm numeric,
  created_at timestamptz not null default now(),
  unique (job_id, recorded_hour)
);

create table public.supplementary_media (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  uploaded_by_installer_id uuid not null references public.installers(id),
  storage_ref text not null,
  sha256_hash text not null,
  exif_check jsonb,
  label text not null default 'supplementary — drone',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index on public.company_installer_links (installer_id);
create index on public.company_installer_links (company_id);
create index on public.jobs (company_id);
create index on public.job_equipment (job_id);
create index on public.job_assignments (job_id);
create index on public.job_assignments (company_installer_link_id);
create index on public.stage_instances (job_id);
create index on public.captures (job_id);
create index on public.captures (stage_instance_id);
create index on public.noncompliance_log (capture_id);
create index on public.panel_register (job_id);
create index on public.panel_register (lower(serial));
create index on public.lodgements (job_id);
create index on public.weather_records (job_id);
create index on public.supplementary_media (job_id);
create index on public.qualifications (installer_id);
