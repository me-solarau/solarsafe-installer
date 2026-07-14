# Solarsafe Installer

Companion docs (read fully before making changes):
- `solarsafe-installer-stage-gate-spec.md` — product spec, **source of truth**. Where this file or any other doc disagrees with the spec, the spec wins.
- `solarsafe-installer-build-kickoff.md` — build phases, stack, schema, pilot plan.

## Ground rules

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

## Repo layout

```
apps/dashboard/    Next.js 14 App Router — employer web dashboard
apps/installer/    Next.js — field capture app, wrapped with Capacitor from Phase 3
packages/shared/    Shared TS types, verification rule definitions
supabase/migrations/  SQL migrations (schema + RLS), applied in filename order
supabase/seed.sql     Local dev seed data only — never reference/fixed data (that belongs in a migration)
```
