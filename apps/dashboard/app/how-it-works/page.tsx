import Link from 'next/link';
import type { Metadata } from 'next';
import { STAGES } from '@solarsafe/shared';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'From point-of-sale job creation to a locked, audit-proof evidence record — how the Solarsafe stage-gate workflow runs an install.',
};

const lifecycle = [
  { state: 'Created', body: 'Office opens the job at point of sale — customer, site, NMI, design. Design import (Pylon first) pre-populates the equipment list and per-plane layout.' },
  { state: 'Populating', body: 'Fields land over weeks: DNSP approval + export limit, confirmed equipment list (locks the AI rule set), DERR arrangements.' },
  { state: 'Scheduled', body: 'Company assigns seats and designates the Lead. The installer sees the job in-app for the first time — fully populated.' },
  { state: 'Install-ready', body: 'All mandatory pre-install fields present. DNSP approval reference is the hard gate — no on-site capture begins before this.' },
  { state: 'In progress', body: 'Stage-gate capture, Stage 0 → 10. Photos hashed, geofenced, attributed to the capturing seat.' },
  { state: 'Signed off', body: 'Admin close-out gate cleared — CCEW lodged, DERR submitted, STC exported, DNSP notified, pack generated, customer handover issued.' },
  { state: 'Locked', body: 'Read-only evidence record. Later third-party confirmations track against it; nothing in the pack can change.' },
];

const closeout = [
  ['CCEW lodged', 'Lead Installer', 'Lodged via eCert / CER Installer Portal, certificate uploaded in-app'],
  ['DERR submitted', 'Lead Installer', 'DER Register entry made, confirmation reference recorded'],
  ['STC pack exported', 'System', 'Canonical pack delivered to the nominated STC agent adapter'],
  ['DNSP notified', 'Lead / office', 'Post-install notification sent, reference recorded'],
  ['Compliance pack', 'System', 'Clause-referenced pack finalised: photos, GPS, timestamps, results'],
  ['Customer handover', 'Lead Installer', 'Handover pack delivered, verification summary issued'],
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-ink-950 py-16 text-white">
        <div className="container-page">
          <span className="eyebrow text-solar-400">How it works</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Data entry is decoupled from the crew. The install runs on rails.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-100/80">
            Jobs are created at point of sale and mature over weeks in the office. Installers only
            ever see assigned jobs — with everything already populated.
          </p>
        </div>
      </section>

      <section className="container-page py-20">
        <span className="eyebrow">Job lifecycle</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">Seven states, one direction.</h2>
        <ol className="mt-10 space-y-4">
          {lifecycle.map((step, i) => (
            <li key={step.state} className="flex gap-5">
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-solar-400">
                  {i + 1}
                </span>
                {i < lifecycle.length - 1 && <span className="my-1 w-px flex-1 bg-ink-100" />}
              </div>
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-ink-900">{step.state}</h3>
                <p className="mt-1 max-w-2xl text-sm text-ink-700">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-ink-50/60 py-20">
        <div className="container-page">
          <span className="eyebrow">Stage-gate capture</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">Eleven stages, gated in sequence.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {STAGES.map((stage) => (
              <div key={stage.key} className="card">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-solar-500/15 text-sm font-bold text-solar-700">
                    {stage.index}
                  </span>
                  <h3 className="font-semibold text-ink-900">{stage.title}</h3>
                </div>
                <p className="mt-3 text-sm text-ink-700">{stage.purpose}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
                  {stage.requiredPhotos.map((p) => (
                    <li key={p.key} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-solar-400" />
                      {p.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <span className="eyebrow">Sign-off</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
          All admin done at sign-off. The crew leaves with nothing on the desk.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-700">
          Sign-off isn&apos;t a photo milestone — it&apos;s the moment every obligation within the
          company&apos;s control is executed. Third-party confirmations that arrive later track on
          the dashboard, but never hold up sign-off.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Completed by</th>
                <th className="px-4 py-3 font-semibold">Done means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {closeout.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-3 font-semibold text-ink-900">{row[0]}</td>
                  <td className="px-4 py-3 text-ink-700">{row[1]}</td>
                  <td className="px-4 py-3 text-ink-700">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <Link href="/#demo" className="btn-primary">
            Book a demo <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
