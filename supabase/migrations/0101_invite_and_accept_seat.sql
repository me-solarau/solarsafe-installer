-- Applied to project hhusohhwqjdpgcgrlzbo (Safe Installer app).
--
-- Seat invitation + acceptance (spec: Account & seat architecture).
--
-- Two problems make invitation impossible from the client under the existing RLS:
--   1. An admin cannot SELECT an installer who already has an account — no
--      policy grants it until a link exists — so they can only blind-insert.
--   2. A blind insert creates a SECOND installer identity for the same human,
--      breaking the spec's "one login per human" rule and forking their
--      capture history and quality metrics.
--
-- invite_installer() resolves both atomically: find-or-create by email, then
-- create the seat. SECURITY DEFINER so it can look across installers, but it
-- verifies the caller owns the company before doing anything.

-- One identity per email. Placeholder rows (auth_user_id null) are matched on
-- email at claim time, so a duplicate would fork a person's identity.
create unique index if not exists installers_email_lower_idx
  on public.installers (lower(email)) where email is not null;

create or replace function public.invite_installer(
  p_company_id uuid,
  p_email text,
  p_full_name text default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(btrim(p_email));
  v_installer public.installers;
  v_link public.company_installer_links;
  v_existing boolean := false;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if v_email is null or v_email = '' or position('@' in v_email) = 0 then
    raise exception 'a valid email is required';
  end if;
  -- The caller must own the company they are inviting into.
  if not exists (
    select 1 from public.companies
    where id = p_company_id and owner_user_id = auth.uid()
  ) then
    raise exception 'not an admin of that company';
  end if;

  select * into v_installer from public.installers
  where lower(email) = v_email limit 1;

  if v_installer.id is null then
    insert into public.installers (full_name, email)
    values (coalesce(nullif(btrim(p_full_name), ''), split_part(v_email, '@', 1)), v_email)
    returning * into v_installer;
  else
    v_existing := true;
  end if;

  select * into v_link from public.company_installer_links
  where company_id = p_company_id and installer_id = v_installer.id;

  if v_link.id is null then
    insert into public.company_installer_links (company_id, installer_id, status)
    values (p_company_id, v_installer.id, 'invited')
    returning * into v_link;
  end if;

  return jsonb_build_object(
    'installer_id', v_installer.id,
    'link_id', v_link.id,
    'status', v_link.status,
    'installer_existed', v_existing,
    'already_linked', (v_link.status is distinct from 'invited')
  );
end $$;

revoke all on function public.invite_installer(uuid, text, text) from public, anon;
grant execute on function public.invite_installer(uuid, text, text) to authenticated;

-- Seat acceptance. This is where consent executes (company data ownership,
-- telemetry capture, NSW workplace surveillance notice) and where billing
-- starts — both recorded against the link with a timestamp, per the spec.
create or replace function public.accept_seat(
  p_link_id uuid,
  p_consent jsonb
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_link public.company_installer_links;
begin
  select * into v_link from public.company_installer_links
  where id = p_link_id and installer_id = private.current_installer_id();
  if v_link.id is null then raise exception 'seat not found for this installer'; end if;
  if v_link.status = 'active' then
    return jsonb_build_object('link_id', v_link.id, 'status', 'active', 'already_active', true);
  end if;
  if p_consent is null or p_consent = '{}'::jsonb then
    raise exception 'consent record is required to activate a seat';
  end if;

  update public.company_installer_links
  set status = 'active',
      consent_record = p_consent,
      consent_at = coalesce(consent_at, now()),
      billing_anchor_at = coalesce(billing_anchor_at, now())
  where id = p_link_id
  returning * into v_link;

  return jsonb_build_object('link_id', v_link.id, 'status', v_link.status, 'already_active', false);
end $$;

revoke all on function public.accept_seat(uuid, jsonb) from public, anon;
grant execute on function public.accept_seat(uuid, jsonb) to authenticated;
