-- RLS policies — the company evidence firewall.
-- Ground rule #6: RLS scoped to `authenticated` only, never `anon`, from the
-- first migration. Ground rule #7: captures / noncompliance_log / panel_register
-- are append-only — no authenticated UPDATE or DELETE grant exists on them, ever.

-- ---------------------------------------------------------------------------
-- Lock down `anon` and enable RLS everywhere, before any policy is defined.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('revoke all on table public.%I from anon', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Helper functions
--
-- security definer so they read company_members / installers / job_assignments
-- without recursing back through those tables' own RLS policies (the standard
-- Supabase pattern for this). search_path is pinned to avoid hijacking.
-- Execute is revoked from anon/public and granted only to authenticated.
-- ---------------------------------------------------------------------------

create or replace function public.auth_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.company_members where auth_user_id = auth.uid()
$$;

create or replace function public.auth_installer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.installers where auth_user_id = auth.uid()
$$;

create or replace function public.installer_assigned_to_job(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_assignments ja
    join public.company_installer_links cil on cil.id = ja.company_installer_link_id
    where ja.job_id = p_job_id
      and ja.superseded_at is null
      and cil.installer_id = public.auth_installer_id()
  )
$$;

create or replace function public.installer_is_lead_on_job(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_assignments ja
    join public.company_installer_links cil on cil.id = ja.company_installer_link_id
    where ja.job_id = p_job_id
      and ja.superseded_at is null
      and ja.role = 'lead'
      and cil.installer_id = public.auth_installer_id()
  )
$$;

create or replace function public.can_access_job(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.jobs j
    where j.id = p_job_id
      and (j.company_id in (select public.auth_company_ids())
           or public.installer_assigned_to_job(j.id))
  )
$$;

revoke execute on function public.auth_company_ids() from public, anon;
revoke execute on function public.auth_installer_id() from public, anon;
revoke execute on function public.installer_assigned_to_job(uuid) from public, anon;
revoke execute on function public.installer_is_lead_on_job(uuid) from public, anon;
revoke execute on function public.can_access_job(uuid) from public, anon;
grant execute on function public.auth_company_ids() to authenticated;
grant execute on function public.auth_installer_id() to authenticated;
grant execute on function public.installer_assigned_to_job(uuid) to authenticated;
grant execute on function public.installer_is_lead_on_job(uuid) to authenticated;
grant execute on function public.can_access_job(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------

grant select, update on public.companies to authenticated;

create policy companies_select on public.companies for select to authenticated
  using (id in (select public.auth_company_ids()));

create policy companies_update on public.companies for update to authenticated
  using (id in (select public.auth_company_ids()));

-- ---------------------------------------------------------------------------
-- company_members
-- ---------------------------------------------------------------------------

grant select on public.company_members to authenticated;

create policy company_members_select on public.company_members for select to authenticated
  using (auth_user_id = auth.uid() or company_id in (select public.auth_company_ids()));

-- ---------------------------------------------------------------------------
-- installers / installer_devices / qualifications
-- ---------------------------------------------------------------------------

grant select, update on public.installers to authenticated;

create policy installers_select on public.installers for select to authenticated
  using (
    auth_user_id = auth.uid()
    or id in (
      select installer_id from public.company_installer_links
      where company_id in (select public.auth_company_ids())
    )
  );

create policy installers_update on public.installers for update to authenticated
  using (auth_user_id = auth.uid());

grant select, insert, update on public.installer_devices to authenticated;

create policy installer_devices_select on public.installer_devices for select to authenticated
  using (installer_id = public.auth_installer_id());

create policy installer_devices_insert on public.installer_devices for insert to authenticated
  with check (installer_id = public.auth_installer_id());

create policy installer_devices_update on public.installer_devices for update to authenticated
  using (installer_id = public.auth_installer_id());

grant select, insert, update on public.qualifications to authenticated;

create policy qualifications_select on public.qualifications for select to authenticated
  using (
    installer_id = public.auth_installer_id()
    or installer_id in (
      select installer_id from public.company_installer_links
      where company_id in (select public.auth_company_ids())
    )
  );

create policy qualifications_insert on public.qualifications for insert to authenticated
  with check (installer_id = public.auth_installer_id());

create policy qualifications_update on public.qualifications for update to authenticated
  using (installer_id = public.auth_installer_id());

-- ---------------------------------------------------------------------------
-- company_installer_links (the seat)
-- ---------------------------------------------------------------------------

grant select, insert, update on public.company_installer_links to authenticated;

create policy cil_select on public.company_installer_links for select to authenticated
  using (company_id in (select public.auth_company_ids()) or installer_id = public.auth_installer_id());

create policy cil_insert on public.company_installer_links for insert to authenticated
  with check (company_id in (select public.auth_company_ids()));

create policy cil_update on public.company_installer_links for update to authenticated
  using (company_id in (select public.auth_company_ids()) or installer_id = public.auth_installer_id());

-- ---------------------------------------------------------------------------
-- jobs / job_equipment / job_assignments
-- ---------------------------------------------------------------------------

grant select, insert, update on public.jobs to authenticated;

create policy jobs_select on public.jobs for select to authenticated
  using (company_id in (select public.auth_company_ids()) or public.installer_assigned_to_job(id));

create policy jobs_insert on public.jobs for insert to authenticated
  with check (company_id in (select public.auth_company_ids()));

create policy jobs_update on public.jobs for update to authenticated
  using (company_id in (select public.auth_company_ids()));

grant select, insert, update on public.job_equipment to authenticated;

create policy job_equipment_select on public.job_equipment for select to authenticated
  using (public.can_access_job(job_id));

create policy job_equipment_insert on public.job_equipment for insert to authenticated
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.company_id in (select public.auth_company_ids())));

create policy job_equipment_update on public.job_equipment for update to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.company_id in (select public.auth_company_ids())));

grant select, insert, update on public.job_assignments to authenticated;

create policy job_assignments_select on public.job_assignments for select to authenticated
  using (public.can_access_job(job_id));

create policy job_assignments_insert on public.job_assignments for insert to authenticated
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.company_id in (select public.auth_company_ids())));

create policy job_assignments_update on public.job_assignments for update to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.company_id in (select public.auth_company_ids())));

-- ---------------------------------------------------------------------------
-- stages (public reference data — same rows visible to every authenticated user)
-- ---------------------------------------------------------------------------

grant select on public.stages to authenticated;

create policy stages_select on public.stages for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- stage_instances, with a DB-level guard on Lead-only confirmation
-- ---------------------------------------------------------------------------

grant select, insert, update on public.stage_instances to authenticated;

create policy stage_instances_select on public.stage_instances for select to authenticated
  using (public.can_access_job(job_id));

create policy stage_instances_insert on public.stage_instances for insert to authenticated
  with check (public.can_access_job(job_id));

create policy stage_instances_update on public.stage_instances for update to authenticated
  using (public.can_access_job(job_id));

-- Spec (Crew roles): "The Lead has final say: stage completion is confirmed
-- by the Lead". RLS alone can't express "only this column change, only by
-- this specific role" cleanly, so this is enforced with a trigger in addition
-- to the row-level policy above.
create or replace function public.enforce_lead_stage_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lead_confirmed_by is distinct from old.lead_confirmed_by
     or new.lead_confirmed_at is distinct from old.lead_confirmed_at then
    if new.lead_confirmed_by is null then
      -- clearing a confirmation is allowed without an actor check
      return new;
    end if;
    if not public.installer_is_lead_on_job(new.job_id) then
      raise exception 'only the job''s designated Lead Installer may confirm a stage';
    end if;
    if new.lead_confirmed_by <> public.auth_installer_id() then
      raise exception 'lead_confirmed_by must match the confirming installer';
    end if;
  end if;
  return new;
end;
$$;

create trigger stage_instances_lead_confirmation
  before update on public.stage_instances
  for each row execute function public.enforce_lead_stage_confirmation();

-- ---------------------------------------------------------------------------
-- captures — append-only (select + insert; no update/delete grant, ever)
-- ---------------------------------------------------------------------------

grant select, insert on public.captures to authenticated;

create policy captures_select on public.captures for select to authenticated
  using (public.can_access_job(job_id));

create policy captures_insert on public.captures for insert to authenticated
  with check (public.installer_assigned_to_job(job_id));

-- ---------------------------------------------------------------------------
-- noncompliance_log — admin-visible only, immutable, written by the
-- server-side AI verification pipeline (service role bypasses RLS).
-- No authenticated insert/update/delete policy exists on this table.
-- ---------------------------------------------------------------------------

grant select on public.noncompliance_log to authenticated;

create policy noncompliance_log_select on public.noncompliance_log for select to authenticated
  using (
    exists (
      select 1 from public.captures c
      join public.jobs j on j.id = c.job_id
      where c.id = capture_id
        and j.company_id in (select public.auth_company_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- panel_register — append-only
-- ---------------------------------------------------------------------------

grant select, insert on public.panel_register to authenticated;

create policy panel_register_select on public.panel_register for select to authenticated
  using (public.can_access_job(job_id));

create policy panel_register_insert on public.panel_register for insert to authenticated
  with check (public.installer_assigned_to_job(job_id));

-- ---------------------------------------------------------------------------
-- lodgements
-- ---------------------------------------------------------------------------

grant select, insert, update on public.lodgements to authenticated;

create policy lodgements_select on public.lodgements for select to authenticated
  using (public.can_access_job(job_id));

create policy lodgements_insert on public.lodgements for insert to authenticated
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.company_id in (select public.auth_company_ids())));

create policy lodgements_update on public.lodgements for update to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.company_id in (select public.auth_company_ids())));

-- ---------------------------------------------------------------------------
-- weather_records — system-written (automatic), read-only for authenticated
-- ---------------------------------------------------------------------------

grant select on public.weather_records to authenticated;

create policy weather_records_select on public.weather_records for select to authenticated
  using (public.can_access_job(job_id));

-- ---------------------------------------------------------------------------
-- supplementary_media — Lead-only upload (drone imagery), append-only
-- ---------------------------------------------------------------------------

grant select, insert on public.supplementary_media to authenticated;

create policy supplementary_media_select on public.supplementary_media for select to authenticated
  using (public.can_access_job(job_id));

create policy supplementary_media_insert on public.supplementary_media for insert to authenticated
  with check (
    public.installer_is_lead_on_job(job_id)
    and uploaded_by_installer_id = public.auth_installer_id()
  );
