# Solarsafe Installer — Build Kickoff (Claude Code)

Companion to `solarsafe-installer-stage-gate-spec.md` v0.19, which is the **source of truth**. Where this document and the spec disagree, the spec wins. Place both in the repo root; reference the spec in every session.

---

## Ground rules (paste into CLAUDE.md)

1. The product spec (`solarsafe-installer-stage-gate-spec.md`) is the source of truth. Do not contradict a locked decision. Proposed changes to locked decisions are raised to Johan, never silently implemented.
2. One feature per session. Finish, verify, stop.
3. Plain-English explanations of every change before implementation. Johan is the architect and approves all changes; he does not write code.
4. No commits without Johan's explicit approval.
5. Never touch files unrelated to the current feature.
6. Security defaults: Supabase RLS policies scoped to `authenticated` (never `anon`) from the first migration. The company evidence firewall is an RLS concern from day one, not a retrofit.
7. Evidence integrity is sacred: no code path may ever delete or mutate a captured photo, verification result, or log entry. Append-only, supersede-never-replace.
8. No standards text, no manufacturer manual text stored or output — extracted parameters with citations only (spec: Standards verification note).

## Stack (locked)

- **Web (employer dashboard):** Next.js 14 (App Router), Vercel
- **Mobile (installer app):** same Next.js codebase or shared packages wrapped with Capacitor; iOS via Codemagic CI/CD (no Mac), Android direct
- **Backend:** Supabase — Auth, Postgres + RLS, Storage (photos), Edge Functions where needed
- **AI verification:** Claude API (vision) via server-side routes; never call from client with keys
- **Billing:** Stripe (web dashboard only — never in-app purchases; spec decision)
- **Repo:** monorepo — `apps/dashboard`, `apps/installer`, `packages/shared` (types, schema, verification rules), `supabase/` (migrations)

## Core schema (first migration set)

- `companies` — account, subscription state
- `installers` — global identity: contact, device bindings
- `qualifications` — licence + SAA accreditation records per installer: type, scope, number, expiry, verification status/date
- `company_installer_links` — THE SEAT: company_id, installer_id, status (invited/active/deactivated), consent record + timestamp, billing anchor
- `jobs` — lifecycle state machine (created → populating → scheduled → install_ready → in_progress → signed_off → locked), site, NMI, DNSP fields (reference, export limit, status), design summary
- `job_equipment` — equipment list entries → rule-set references
- `job_assignments` — seat ↔ job, role (lead | installer), designation history
- `stages` / `stage_instances` — per-job stage state, Lead confirmation records
- `captures` — photos: storage ref, hash, GPS, timestamp, device, seat, stage ref, verification outcome, clause refs
- `noncompliance_log` — FAIL entries: capture ref, AI response, rectification note, closure record (immutable, admin-visible flag)
- `panel_register` — serials per job (+ platform-wide duplicate index)
- `lodgements` — per job: type (dnsp/stc/ccew/derr), status, reference, evidence upload ref, responsible party
- `weather_records` — per job: hourly conditions across install window
- `supplementary_media` — drone uploads: EXIF check results, hash, Lead uploader

## Build phases (each phase = shippable, testable)

**Phase 0 — Scaffold (1–2 sessions)**
Repo, monorepo tooling, Supabase project, auth (company admin + installer roles), first migration set above, RLS policies, CI to Vercel.

**Phase 1 — Accounts & seats (dashboard)**
Company signup, installer identity creation, invitation → acceptance → seat activation flow with consent capture, roster view, qualification entry (manual entry + expiry tracking v1; register verification automation later).

**Phase 2 — Jobs & lifecycle (dashboard)**
Job creation (manual fields v1; Pylon import parser deferred until format confirmed), lifecycle state machine, DNSP/DERR reference fields with fallback deep-links, pipeline view with field-completeness, seat assignment + Lead designation (qualification-gated picker).

**Phase 3 — Capture (installer app)**
Capacitor shell, assigned-jobs list, stage-gate capture flow for ALL stages (photos + metadata + hashing + geofence), offline queue + sync with Lead authority, Lead stage confirmation. **No AI verification yet — every photo auto-passes to a "pending review" state.** This gets the capture workflow into real hands (Me-Solar pilot jobs) fastest.

**Phase 4 — AI verification (pilot stages)**
Claude vision verification for two stages first: **Stage 8 (signage — easiest, most deterministic)** and **Stage 4 (serial capture + barcode + duplicate detection)**. Rectification flow: FAIL → note → re-photo → Lead closure → non-compliance log. Then extend stage by stage, hardest last (Stage 2 spacing, Stage 9 instrument reading).

**Phase 5 — Close-out & compliance pack**
Admin close-out gate, CCEW upload, lodgement tracker, sign-off → job lock, compliance pack PDF generation (Solarsafe letter format), customer verification summary.

**Phase 6 — Exports, weather, extras**
STC agent export adapters (start with whichever agent answered the format question), weather record automation, drone supplementary slot, telemetry dashboards.

**Deferred by design:** battery stage pack (v1.1), SPV App Provider (v2), eCert API (when released), portable installer profiles (v2), Pylon API (after format confirmation).

## Pilot plan

Run Phases 0–3 against real Me-Solar installs — Johan is both the company and a Lead-eligible installer, which makes him the perfect single-user pilot. AI verification (Phase 4) tunes against real photos from those jobs before any external customer sees a verdict.

## Session 1 instruction (paste into Claude Code)

"Read solarsafe-installer-stage-gate-spec.md and this kickoff document fully before doing anything. Then: initialise the monorepo per the Stack section, set up the Supabase migration for the core schema, and write RLS policies enforcing the company evidence firewall (authenticated-scoped only). Explain your schema decisions in plain English and wait for my approval before creating any files."

## Parked design decisions (resolve during relevant phase, not before)

- Override policy (UNVERIFIABLE escalation + DNSP-gate edge cases) → resolve at Phase 4
- Verification-call budget / fair-use cap numbers → resolve at Phase 4 with real per-job photo counts from the pilot
- Solo-unlicensed-installer / remote Lead question → resolve at Phase 2 (confirm NSW certification obligations first)
- Pylon export format → business development task, parallel to build
- Solicitor items: seat consent wording, surveillance notice → parallel to build, needed before first external customer
