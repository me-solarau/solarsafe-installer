# Solarsafe Installer — repository guide

## Source of truth

`solarsafe-installer-stage-gate-spec.md` (v0.19) is the **product source of truth**.
`solarsafe-installer-build-kickoff.md` is the build plan. Where they disagree, the spec wins.

## Ground rules

1. The product spec is the source of truth. Do not contradict a locked decision. Proposed
   changes to locked decisions are raised to Johan, never silently implemented.
2. One feature per session. Finish, verify, stop.
3. Plain-English explanations of every change before implementation. Johan is the architect
   and approves all changes; he does not write code.
4. No commits without Johan's explicit approval.
5. Never touch files unrelated to the current feature.
6. Security defaults: Supabase RLS policies scoped to `authenticated` (never `anon`) from the
   first migration. The company evidence firewall is an RLS concern from day one, not a retrofit.
7. Evidence integrity is sacred: no code path may ever delete or mutate a captured photo,
   verification result, or log entry. Append-only, supersede-never-replace.
8. No standards text, no manufacturer manual text stored or output — extracted parameters with
   citations only.

## Stack (locked)

- **Web (employer dashboard + marketing):** Next.js 14 (App Router), Vercel — `apps/dashboard`
- **Mobile (installer app):** Next.js shared code wrapped with Capacitor — `apps/installer`
- **Shared:** types, schema, verification rules, stage definitions — `packages/shared`
- **Backend:** Supabase — Auth, Postgres + RLS, Storage, Edge Functions — `supabase/`
- **AI verification:** Claude API (vision) via server-side routes only; never client-side keys
- **Billing:** Stripe (web dashboard only — never in-app purchases)

## Monorepo layout

```
apps/dashboard    Next.js — public marketing site (/) + employer dashboard (/dashboard)
apps/installer    Next.js + Capacitor shell — installer capture app
packages/shared   Cross-app TypeScript: DB row types, stage definitions, verification outcomes
supabase/         config.toml + SQL migrations (core schema + RLS)
```

## Commands

```
npm install                 # install all workspaces
npm run dev                 # dashboard dev server (marketing + dashboard)
npm run dev:installer       # installer app dev server
npm run build               # build all workspaces
npm run typecheck           # typecheck all workspaces
```

## Build phases

Phase 0 (this scaffold) → 1 Accounts & seats → 2 Jobs & lifecycle → 3 Capture →
4 AI verification → 5 Close-out & compliance pack → 6 Exports, weather, extras.
See `solarsafe-installer-build-kickoff.md` for the full phase plan.
