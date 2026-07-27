# Solarsafe Installer

Stage-gate photo verification for grid-connected rooftop PV. Photograph once, prove compliance
forever.

> Source of truth: [`solarsafe-installer-stage-gate-spec.md`](./solarsafe-installer-stage-gate-spec.md) (v0.19).
> Build plan: [`solarsafe-installer-build-kickoff.md`](./solarsafe-installer-build-kickoff.md).
> Repo conventions and ground rules: [`CLAUDE.md`](./CLAUDE.md).

## Monorepo layout

```
apps/dashboard    Next.js 14 (App Router) — public marketing site (/) + employer dashboard (/dashboard)
apps/installer    Next.js + Capacitor shell — installer capture app (static export → native)
packages/shared   Shared TypeScript — DB row types, stage definitions, verification outcomes
supabase/         config.toml + SQL migrations (core schema + RLS, evidence-integrity triggers)
```

## Getting started

```bash
npm install            # install all workspaces
npm run dev            # marketing site + dashboard on http://localhost:3000
npm run dev:installer  # installer app on http://localhost:3001
```

### Database

The first migration (`supabase/migrations/0001_core_schema.sql`) creates the core schema with:

- **Company evidence firewall** — RLS on every table, every policy scoped to `authenticated`
  (never `anon`). Companies see only their own jobs/evidence/telemetry.
- **Append-only integrity** — `captures` and `panel_register` reject UPDATE/DELETE (RLS + trigger);
  `noncompliance_log` is immutable in its core fields with write-once closure. Re-captures
  supersede, they never replace.

Apply it with the Supabase CLI:

```bash
supabase start           # local stack
supabase db reset        # applies migrations to the local db
```

## What's built (Phase 0 scaffold)

- Monorepo tooling (npm workspaces + shared TS config)
- Marketing website: landing, how-it-works, pricing, and a working "Book a demo" lead form
- Employer dashboard shell + installer app shell (both render the shared stage checklist)
- Core Supabase schema + RLS + evidence-integrity triggers

## What's next

Phase 1 (accounts & seats) → Phase 2 (jobs & lifecycle) → Phase 3 (capture) → Phase 4 (AI
verification) → Phase 5 (close-out & compliance pack) → Phase 6 (exports, weather, extras).
See the build kickoff for the full plan.
