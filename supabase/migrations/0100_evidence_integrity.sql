-- Applied to project hhusohhwqjdpgcgrlzbo (Safe Installer app).
--
-- Evidence integrity (spec Ground rule #7): no code path may ever delete or
-- mutate a captured photo, verification result, or log entry. Append-only,
-- supersede-never-replace.
--
-- RLS alone cannot guarantee this — the service role bypasses RLS, and server
-- code runs as the service role. Enforce at the table with triggers so the
-- guarantee holds no matter which key is used.

create or replace function public.forbid_mutation()
returns trigger language plpgsql as $$
begin
  raise exception '% is append-only; % is not permitted (evidence integrity)',
    tg_table_name, tg_op;
end $$;

-- captures: a re-capture supersedes, it never replaces.
drop trigger if exists captures_no_update on public.captures;
drop trigger if exists captures_no_delete on public.captures;
create trigger captures_no_update before update on public.captures
  for each row execute function public.forbid_mutation();
create trigger captures_no_delete before delete on public.captures
  for each row execute function public.forbid_mutation();

-- panel_register: serials cannot be edited after the fact (SPV posture —
-- "no editing of serial records after job completion").
drop trigger if exists panel_register_no_update on public.panel_register;
drop trigger if exists panel_register_no_delete on public.panel_register;
create trigger panel_register_no_update before update on public.panel_register
  for each row execute function public.forbid_mutation();
create trigger panel_register_no_delete before delete on public.panel_register
  for each row execute function public.forbid_mutation();

-- noncompliance_log: never deleted; the original FAIL and the AI's response are
-- immutable. Only the rectification chain may be appended, and closure is
-- write-once so corrective work can never be silently re-closed.
create or replace function public.noncompliance_guard()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'noncompliance_log entries can never be deleted (evidence integrity)';
  end if;
  if new.capture_id is distinct from old.capture_id
     or new.ai_response is distinct from old.ai_response
     or new.created_at is distinct from old.created_at then
    raise exception 'noncompliance_log core fields are immutable; only the rectification chain may be recorded';
  end if;
  if old.closure_record is not null and new.closure_record is distinct from old.closure_record then
    raise exception 'noncompliance_log closure is write-once';
  end if;
  return new;
end $$;

drop trigger if exists noncompliance_guard_update on public.noncompliance_log;
drop trigger if exists noncompliance_guard_delete on public.noncompliance_log;
create trigger noncompliance_guard_update before update on public.noncompliance_log
  for each row execute function public.noncompliance_guard();
create trigger noncompliance_guard_delete before delete on public.noncompliance_log
  for each row execute function public.noncompliance_guard();
