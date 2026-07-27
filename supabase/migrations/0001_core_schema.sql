-- =============================================================================
-- Solarsafe Installer — core schema (first migration set)
--
-- Source of truth: solarsafe-installer-stage-gate-spec.md v0.19
--
-- Security posture (Ground rules #6, #7):
--   * RLS enabled on every table; every policy is scoped to `authenticated`,
--     never `anon`. The company evidence firewall is enforced here, not
--     retrofitted.
--   * Evidence integrity is sacred: captures and the non-compliance log are
--     append-only. Re-captures SUPERSEDE, they never replace. This is enforced
--     with triggers as well as by withholding UPDATE/DELETE policies.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type subscription_state as enum ('trialing', 'active', 'past_due', 'canceled');
create type seat_status as enum ('invited', 'active', 'deactivated');
create type crew_role as enum ('lead', 'installer');
create type qualification_type as enum ('electrical_licence', 'saa_accreditation');
create type qualification_verification as enum ('unverified', 'verified', 'expired', 'lapsed');
create type job_state as enum (
  'created', 'populating', 'scheduled', 'install_ready', 'in_progress', 'signed_off', 'locked'
);
create type dnsp_status as enum ('not_applied', 'applied_pending', 'approved');
create type lodgement_type as enum ('dnsp', 'stc', 'ccew', 'derr');
create type lodgement_status as enum ('not_started', 'submitted', 'confirmed');
create type verification_outcome as enum ('pending', 'pass', 'conditional_pass', 'fail', 'unverifiable');

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Company account + subscription state.
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subscription_state subscription_state not null default 'trialing',
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- Company-side users (dashboard admins). Not in the original schema list, but
-- required to anchor the company evidence firewall to auth users.
create table company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (company_id, auth_user_id)
);

-- Global installer identity — one login per human, owned by the installer.
create table installers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  device_bindings text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Vetted qualification set per installer (licence + SAA accreditation).
create table qualifications (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references installers (id) on delete cascade,
  type qualification_type not null,
  scope text not null,
  number text not null,
  state text,
  expiry date,
  verification_status qualification_verification not null default 'unverified',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- THE SEAT — an active company↔installer link.
create table company_installer_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  installer_id uuid not null references installers (id) on delete cascade,
  status seat_status not null default 'invited',
  consent_recorded_at timestamptz,
  consent_version text,
  billing_started_at timestamptz,
  billing_stopped_at timestamptz,
  invited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (company_id, installer_id)
);

-- Job lifecycle state machine.
create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  state job_state not null default 'created',
  site_address text not null,
  site_lat double precision,
  site_lng double precision,
  nmi text,
  system_type text not null default 'grid_pv',
  design_summary jsonb,
  dnsp_name text,
  dnsp_reference text,
  dnsp_export_limit_kw numeric,
  dnsp_status dnsp_status not null default 'not_applied',
  created_at timestamptz not null default now(),
  locked_at timestamptz
);

-- Equipment list — the AI's rule source per job.
create table job_equipment (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  category text not null,
  brand text not null,
  model text not null,
  rule_set_ref text,
  created_at timestamptz not null default now()
);

-- Seat ↔ job assignment with per-job role (exactly one lead per job).
create table job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  seat_id uuid not null references company_installer_links (id) on delete cascade,
  role crew_role not null default 'installer',
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);

-- Per-job stage state + Lead confirmation record.
create table stage_instances (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  stage_index int not null check (stage_index between 0 and 10),
  lead_confirmed_by_seat uuid references company_installer_links (id),
  lead_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, stage_index)
);

-- Captures — photos. APPEND-ONLY (see triggers below).
create table captures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  stage_index int not null check (stage_index between 0 and 10),
  photo_key text not null,
  storage_ref text not null,
  hash text not null,
  gps_lat double precision,
  gps_lng double precision,
  captured_at timestamptz not null,
  device_id text,
  seat_id uuid not null references company_installer_links (id),
  verification_outcome verification_outcome not null default 'pending',
  clause_refs text[] not null default '{}',
  supersedes_capture_id uuid references captures (id),
  created_at timestamptz not null default now()
);

-- Non-compliance log — FAIL chain. IMMUTABLE, admin-visible (see triggers).
create table noncompliance_log (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  capture_id uuid not null references captures (id),
  ai_response text not null,
  clause_refs text[] not null default '{}',
  rectification_note text,
  closed_by_seat uuid references company_installer_links (id),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Panel register — serials per job + platform-wide duplicate index.
create table panel_register (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  serial text not null,
  brand text,
  model text,
  capture_id uuid references captures (id),
  duplicate_flag boolean not null default false,
  created_at timestamptz not null default now()
);

-- Regulatory lodgement tracker (DNSP / STC / CCEW / DERR).
create table lodgements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  type lodgement_type not null,
  status lodgement_status not null default 'not_started',
  reference text,
  responsible_party text,
  evidence_ref text,
  recorded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, type)
);

-- Automatic install-day weather record.
create table weather_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  observed_at timestamptz not null,
  temperature_c numeric,
  wind_speed_kmh numeric,
  wind_gust_kmh numeric,
  precipitation_mm numeric,
  created_at timestamptz not null default now()
);

-- Supplementary media — drone imagery, the sole controlled capture exception.
create table supplementary_media (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  storage_ref text not null,
  hash text not null,
  exif_timestamp timestamptz,
  exif_gps_lat double precision,
  exif_gps_lng double precision,
  exif_check_passed boolean not null default false,
  uploaded_by_seat uuid not null references company_installer_links (id),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index company_members_user_idx on company_members (auth_user_id);
create index installers_auth_idx on installers (auth_user_id);
create index qualifications_installer_idx on qualifications (installer_id);
create index links_company_idx on company_installer_links (company_id);
create index links_installer_idx on company_installer_links (installer_id);
create index jobs_company_idx on jobs (company_id);
create index job_equipment_job_idx on job_equipment (job_id);
create index job_assignments_job_idx on job_assignments (job_id);
create index job_assignments_seat_idx on job_assignments (seat_id);
create index stage_instances_job_idx on stage_instances (job_id);
create index captures_job_stage_idx on captures (job_id, stage_index);
create index noncompliance_job_idx on noncompliance_log (job_id);
-- Platform-wide duplicate-serial index (fraud signal across ALL jobs).
create index panel_register_serial_idx on panel_register (serial);
create index lodgements_job_idx on lodgements (job_id);
create index weather_records_job_idx on weather_records (job_id);
create index supplementary_media_job_idx on supplementary_media (job_id);

-- -----------------------------------------------------------------------------
-- Access helper functions (SECURITY DEFINER: they read membership tables
-- directly and so avoid RLS recursion in the policies that call them).
-- -----------------------------------------------------------------------------
create or replace function public.current_installer_id()
returns uuid language sql stable security definer set search_path = public, auth as $$
  select id from installers where auth_user_id = auth.uid();
$$;

create or replace function public.is_company_member(p_company uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from company_members
    where company_id = p_company and auth_user_id = auth.uid()
  );
$$;

create or replace function public.installer_has_job(p_job uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1
    from job_assignments ja
    join company_installer_links l on l.id = ja.seat_id
    join installers i on i.id = l.installer_id
    where ja.job_id = p_job
      and ja.unassigned_at is null
      and i.auth_user_id = auth.uid()
  );
$$;

create or replace function public.installer_is_lead(p_job uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1
    from job_assignments ja
    join company_installer_links l on l.id = ja.seat_id
    join installers i on i.id = l.installer_id
    where ja.job_id = p_job
      and ja.role = 'lead'
      and ja.unassigned_at is null
      and i.auth_user_id = auth.uid()
  );
$$;

create or replace function public.has_job_access(p_job uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from jobs j
    where j.id = p_job
      and (public.is_company_member(j.company_id) or public.installer_has_job(p_job))
  );
$$;

-- Company bootstrap: create the company and add the caller as its first admin
-- atomically. Company creation goes through here so the companies/company_members
-- INSERT surface can stay closed to direct writes.
create or replace function public.create_company(p_name text)
returns companies language plpgsql security definer set search_path = public, auth as $$
declare
  v_company companies;
begin
  if auth.uid() is null then
    raise exception 'must be authenticated to create a company';
  end if;
  insert into companies (name) values (p_name) returning * into v_company;
  insert into company_members (company_id, auth_user_id, role)
    values (v_company.id, auth.uid(), 'admin');
  return v_company;
end;
$$;

-- -----------------------------------------------------------------------------
-- Evidence-integrity triggers (append-only / supersede-never-replace).
-- -----------------------------------------------------------------------------
create or replace function public.forbid_mutation()
returns trigger language plpgsql as $$
begin
  raise exception '% is append-only; % is not permitted (evidence integrity)',
    tg_table_name, tg_op;
end;
$$;

create trigger captures_no_update before update on captures
  for each row execute function public.forbid_mutation();
create trigger captures_no_delete before delete on captures
  for each row execute function public.forbid_mutation();

create trigger panel_register_no_update before update on panel_register
  for each row execute function public.forbid_mutation();
create trigger panel_register_no_delete before delete on panel_register
  for each row execute function public.forbid_mutation();

-- Non-compliance log: never deleted; core fields never edited; closure is
-- write-once (rectification note and Lead closure record may be added).
create or replace function public.noncompliance_guard()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'noncompliance_log entries can never be deleted (evidence integrity)';
  end if;
  if new.job_id is distinct from old.job_id
     or new.capture_id is distinct from old.capture_id
     or new.ai_response is distinct from old.ai_response
     or new.clause_refs is distinct from old.clause_refs
     or new.created_at is distinct from old.created_at then
    raise exception 'noncompliance_log core fields are immutable; only the rectification chain may be recorded';
  end if;
  if old.closed_at is not null and new.closed_at is distinct from old.closed_at then
    raise exception 'noncompliance_log closure is write-once';
  end if;
  return new;
end;
$$;

create trigger noncompliance_guard_update before update on noncompliance_log
  for each row execute function public.noncompliance_guard();
create trigger noncompliance_guard_delete before delete on noncompliance_log
  for each row execute function public.noncompliance_guard();

-- =============================================================================
-- Row-Level Security — every policy scoped to `authenticated`, never `anon`.
-- =============================================================================
alter table companies enable row level security;
alter table company_members enable row level security;
alter table installers enable row level security;
alter table qualifications enable row level security;
alter table company_installer_links enable row level security;
alter table jobs enable row level security;
alter table job_equipment enable row level security;
alter table job_assignments enable row level security;
alter table stage_instances enable row level security;
alter table captures enable row level security;
alter table noncompliance_log enable row level security;
alter table panel_register enable row level security;
alter table lodgements enable row level security;
alter table weather_records enable row level security;
alter table supplementary_media enable row level security;

-- companies: members read/update their own company; creation via create_company().
create policy companies_select on companies for select to authenticated
  using (public.is_company_member(id));
create policy companies_update on companies for update to authenticated
  using (public.is_company_member(id)) with check (public.is_company_member(id));

-- company_members: see yourself and fellow members; existing admins add members.
create policy company_members_select on company_members for select to authenticated
  using (auth_user_id = auth.uid() or public.is_company_member(company_id));
create policy company_members_insert on company_members for insert to authenticated
  with check (public.is_company_member(company_id));

-- installers: own your identity; companies you're linked to can read it.
create policy installers_select on installers for select to authenticated
  using (
    auth_user_id = auth.uid()
    or exists (
      select 1 from company_installer_links l
      where l.installer_id = installers.id and public.is_company_member(l.company_id)
    )
  );
create policy installers_insert on installers for insert to authenticated
  with check (auth_user_id = auth.uid());
create policy installers_update on installers for update to authenticated
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- qualifications: installer owns; linked companies read (instant vetted set).
create policy qualifications_select on qualifications for select to authenticated
  using (
    installer_id = public.current_installer_id()
    or exists (
      select 1 from company_installer_links l
      where l.installer_id = qualifications.installer_id and public.is_company_member(l.company_id)
    )
  );
create policy qualifications_insert on qualifications for insert to authenticated
  with check (installer_id = public.current_installer_id());
create policy qualifications_update on qualifications for update to authenticated
  using (installer_id = public.current_installer_id())
  with check (installer_id = public.current_installer_id());

-- seats: company manages; installer sees and accepts (consent) their own links.
create policy links_select on company_installer_links for select to authenticated
  using (public.is_company_member(company_id) or installer_id = public.current_installer_id());
create policy links_insert on company_installer_links for insert to authenticated
  with check (public.is_company_member(company_id));
create policy links_update on company_installer_links for update to authenticated
  using (public.is_company_member(company_id) or installer_id = public.current_installer_id())
  with check (public.is_company_member(company_id) or installer_id = public.current_installer_id());

-- jobs: company owns; assigned installers can read (states 3–6 in the app).
create policy jobs_select on jobs for select to authenticated
  using (public.is_company_member(company_id) or public.installer_has_job(id));
create policy jobs_insert on jobs for insert to authenticated
  with check (public.is_company_member(company_id));
create policy jobs_update on jobs for update to authenticated
  using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

-- job_equipment: office-managed (locks the AI rule set); crew reads via job access.
create policy job_equipment_select on job_equipment for select to authenticated
  using (public.has_job_access(job_id));
create policy job_equipment_write on job_equipment for all to authenticated
  using (exists (select 1 from jobs j where j.id = job_id and public.is_company_member(j.company_id)))
  with check (exists (select 1 from jobs j where j.id = job_id and public.is_company_member(j.company_id)));

-- job_assignments: company assigns seats + designates Lead; crew reads.
create policy job_assignments_select on job_assignments for select to authenticated
  using (public.has_job_access(job_id));
create policy job_assignments_write on job_assignments for all to authenticated
  using (exists (select 1 from jobs j where j.id = job_id and public.is_company_member(j.company_id)))
  with check (exists (select 1 from jobs j where j.id = job_id and public.is_company_member(j.company_id)));

-- stage_instances: readable with job access; created with job access;
-- confirmation (update) is Lead-only.
create policy stage_instances_select on stage_instances for select to authenticated
  using (public.has_job_access(job_id));
create policy stage_instances_insert on stage_instances for insert to authenticated
  with check (public.has_job_access(job_id));
create policy stage_instances_update on stage_instances for update to authenticated
  using (public.installer_is_lead(job_id) or exists (
    select 1 from jobs j where j.id = job_id and public.is_company_member(j.company_id)))
  with check (public.installer_is_lead(job_id) or exists (
    select 1 from jobs j where j.id = job_id and public.is_company_member(j.company_id)));

-- captures: append-only. Readable with job access; inserted by the capturing
-- installer's own seat, on a job they're assigned to, that is not yet locked.
-- No UPDATE/DELETE policies exist — mutation is denied by RLS and by trigger.
create policy captures_select on captures for select to authenticated
  using (public.has_job_access(job_id));
create policy captures_insert on captures for insert to authenticated
  with check (
    public.installer_has_job(job_id)
    and seat_id in (
      select l.id from company_installer_links l
      where l.installer_id = public.current_installer_id()
    )
    and exists (select 1 from jobs j where j.id = job_id and j.locked_at is null)
  );

-- noncompliance_log: readable with job access; inserted with job access
-- (server/edge on FAIL); closure update is Lead-only. Immutability by trigger.
create policy noncompliance_select on noncompliance_log for select to authenticated
  using (public.has_job_access(job_id));
create policy noncompliance_insert on noncompliance_log for insert to authenticated
  with check (public.has_job_access(job_id));
create policy noncompliance_update on noncompliance_log for update to authenticated
  using (public.installer_is_lead(job_id))
  with check (public.installer_is_lead(job_id));

-- panel_register: append-only; readable with job access; inserted on capture.
create policy panel_register_select on panel_register for select to authenticated
  using (public.has_job_access(job_id));
create policy panel_register_insert on panel_register for insert to authenticated
  with check (public.installer_has_job(job_id));

-- lodgements: tracked with job access (office + Lead close-out).
create policy lodgements_select on lodgements for select to authenticated
  using (public.has_job_access(job_id));
create policy lodgements_write on lodgements for all to authenticated
  using (public.has_job_access(job_id)) with check (public.has_job_access(job_id));

-- weather_records: automatic (system-written); readable with job access.
create policy weather_select on weather_records for select to authenticated
  using (public.has_job_access(job_id));
create policy weather_insert on weather_records for insert to authenticated
  with check (public.has_job_access(job_id));

-- supplementary_media: drone — Lead-only upload; readable with job access.
create policy supplementary_select on supplementary_media for select to authenticated
  using (public.has_job_access(job_id));
create policy supplementary_insert on supplementary_media for insert to authenticated
  with check (public.installer_is_lead(job_id));
