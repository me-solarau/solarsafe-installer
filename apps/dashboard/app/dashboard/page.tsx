import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employer dashboard',
  robots: { index: false },
};

/**
 * Employer dashboard shell (Phase 0 placeholder).
 *
 * Auth (Supabase), the roster, pipeline view, and lodgement tracker land in
 * Phase 1–2. This page exists so the route and layout are wired and the
 * "Sign in" link has a destination.
 */
export default function DashboardPage() {
  const panels = [
    { title: 'Roster & seats', phase: 'Phase 1', body: 'Invite installers, activate seats with consent capture, track accreditation status and pass rates.' },
    { title: 'Job pipeline', phase: 'Phase 2', body: 'Jobs by lifecycle state with field-completeness; amber flags on approaching installs with gaps.' },
    { title: 'Lodgement tracker', phase: 'Phase 2', body: 'DNSP · STC · CCEW · DERR status board per job, with references and responsible party.' },
    { title: 'Compliance packs', phase: 'Phase 5', body: 'Locked, clause-referenced evidence records and customer verification summaries.' },
  ];
  return (
    <div className="container-page py-16">
      <div className="rounded-2xl border border-ink-100 bg-ink-50 p-8">
        <span className="eyebrow">Employer dashboard</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">Coming together, phase by phase.</h1>
        <p className="mt-3 max-w-2xl text-ink-700">
          This is the Phase 0 scaffold. Authentication and the modules below are built in the
          upcoming phases — the routes and evidence schema are already in place.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {panels.map((p) => (
          <div key={p.title} className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">{p.title}</h2>
              <span className="rounded-md bg-ink-900 px-2 py-1 text-[11px] font-semibold text-solar-400">{p.phase}</span>
            </div>
            <p className="mt-2 text-sm text-ink-700">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm font-semibold text-solar-700 hover:text-solar-600">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
