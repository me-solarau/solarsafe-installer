# Supabase — which database is which

This repo touches **two different Supabase projects**. Getting them confused is
easy and expensive, so read this before applying anything.

## 1. Safe Installer app — the product database

**Project ref:** `hhusohhwqjdpgcgrlzbo` · `https://hhusohhwqjdpgcgrlzbo.supabase.co`

This is the Solarsafe Installer product: companies, installers, qualifications,
seats (`company_installer_links`), jobs, stages, captures, non-compliance log,
panel register, lodgements, weather, supplementary media.

**The baseline schema was created outside this repo**, directly in that project,
before this repo existed. It is therefore *not* reproducible from
`migrations/` alone — the files here are **additive changes on top of that
baseline**, numbered from `0100` to make the discontinuity obvious.

A `0001_core_schema.sql` used to sit here proposing a *different* schema for the
same product (it added `company_members`, omitted the `stages` table, and used
different column names). It was never applied anywhere and actively contradicted
the live database, so it has been removed. **The live project is the source of
truth for the baseline.**

### Design notes worth knowing (derived from the live schema)
- Company↔admin is a single `companies.owner_user_id`, not a members table.
- RLS helpers live in a **`private`** schema: `current_installer_id()`,
  `admin_company_ids()`, `current_user_email()`, `my_seat_ids()`,
  `my_assigned_job_ids()`, `my_lead_job_ids()`.
- Every policy is scoped to `authenticated` — there are **zero** `anon`/`public`
  policies (spec Ground rule #6). Keep it that way.
- The invitation flow is: admin creates a **placeholder installer**
  (`auth_user_id is null` + email) → the installer signs up → they **claim** the
  unclaimed row matching their own email.

### Migrations in this folder (applied to `hhusohhwqjdpgcgrlzbo`)
- `0100_evidence_integrity.sql` — append-only triggers on `captures` and
  `panel_register`, immutability + write-once closure on `noncompliance_log`.
  Required by Ground rule #7; the baseline had no such guards, and RLS alone
  cannot provide them because the service role bypasses RLS.
- `0101_invite_and_accept_seat.sql` — `invite_installer()` and `accept_seat()`
  RPCs, plus a unique index on `lower(email)` so one human can never end up with
  two installer identities.

## 2. Solarsearch — a *different* project

**Project ref:** `vbpzigwgfmchdpvxetge`

`0002_demo_requests.sql` was applied **there**, not to the installer database. It
creates the `demo_requests` table behind the marketing site's "Book a demo" form.
It lives in this repo only because the marketing site does; it is deliberately
kept away from the installer schema (marketing leads are not job evidence).

Do not apply `0002_demo_requests.sql` to the installer project, and do not apply
the `0100`/`0101` migrations to Solarsearch.
