import Link from 'next/link';
import { STAGES } from '@solarsafe/shared';
import { LeadForm } from '@/components/lead-form';
import {
  ArrowIcon,
  CameraGateIcon,
  ClipboardTrackIcon,
  DocStackIcon,
  SeatsIcon,
  ShieldCheckIcon,
  TrendIcon,
} from '@/components/icons';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <PainSection />
      <FeaturesSection />
      <GateSection />
      <OutcomesSection />
      <LodgementSection />
      <TelemetrySection />
      <SeatsSection />
      <PricingPreview />
      <DemoSection />
    </>
  );
}

/* ------------------------------------------------------------------ Hero */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-solar-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-ink-100">
            <span className="h-1.5 w-1.5 rounded-full bg-verify-400" />
            Built for NSW retailers — eCert mandatory-digital from July 2026
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Photograph once.
            <br />
            <span className="text-solar-400">Prove compliance forever.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-100/80">
            Solarsafe Installer gates every rooftop solar install stage-by-stage. Crews capture the
            right photo, AI verifies it on the spot, and you get an audit-proof evidence pack, STC
            claim file, and every NSW lodgement tracked — from one app.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="#demo" className="btn-primary">
              Book a demo <ArrowIcon />
            </Link>
            <Link href="/how-it-works" className="btn border border-white/20 text-white hover:bg-white/10">
              See how the gate works
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-100/60">
            Piloting on real Me-Solar installs. No per-job pricing — seats, not surprises.
          </p>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  const rows = [
    { stage: 'Stage 0 · Pre-start survey', state: 'pass' },
    { stage: 'Stage 1 · Roof fixings', state: 'pass' },
    { stage: 'Stage 4 · Serials + STC', state: 'conditional' },
    { stage: 'Stage 8 · Signage', state: 'fail' },
    { stage: 'Stage 9 · Commissioning', state: 'pending' },
  ] as const;

  const badge: Record<string, string> = {
    pass: 'bg-verify-500/15 text-verify-400 border-verify-500/30',
    conditional: 'bg-solar-500/15 text-solar-300 border-solar-500/30',
    fail: 'bg-red-500/15 text-red-300 border-red-500/30',
    pending: 'bg-white/10 text-ink-100/70 border-white/15',
  };
  const label: Record<string, string> = {
    pass: 'PASS',
    conditional: 'CONDITIONAL',
    fail: 'FAIL — re-photo',
    pending: 'PENDING',
  };

  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-100/50">Job · 14 Ridgeline Dr</p>
            <p className="text-sm font-semibold text-white">6.6kW · tile · single-phase</p>
          </div>
          <span className="rounded-md bg-solar-500/20 px-2 py-1 text-xs font-semibold text-solar-300">
            In progress
          </span>
        </div>
        <ul className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <li key={r.stage} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink-100/85">{r.stage}</span>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badge[r.state]}`}>
                {label[r.state]}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-ink-100/80">
          <span className="font-semibold text-red-300">Rectification note:</span> Inverter shutdown
          label missing beside unit. Re-photo required after fix — Lead closure pending.
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- TrustBar */
function TrustBar() {
  const stats = [
    { value: '11', label: 'gated stages, 0 → 10' },
    { value: '100%', label: 'photos hashed at capture' },
    { value: '4', label: 'NSW lodgements, one tracker' },
    { value: '1', label: 'app — capture to sign-off' },
  ];
  return (
    <section className="border-b border-ink-100 bg-ink-50/60">
      <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold tracking-tight text-ink-900">{s.value}</p>
            <p className="mt-1 text-sm text-ink-700">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- PainSection */
function PainSection() {
  const pains = [
    {
      before: '“Your installer cracked my tiles.”',
      after: 'Timestamped, GPS-locked before-photos prove the defect predates the install.',
    },
    {
      before: 'STC audit letter lands. Where are the serials?',
      after: 'Every serial scanned on-site with GPS — the exact evidence set the CER expects.',
    },
    {
      before: 'A subbie crew’s quality is slipping. You hear about it in refunds.',
      after: 'First-time pass rate + stage-duration drift flags it weeks earlier, passively.',
    },
  ];
  return (
    <section className="container-page py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">The problem</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Disputes and audits are won or lost on evidence you didn&apos;t capture.
        </h2>
        <p className="mt-4 text-lg text-ink-700">
          Running crews at volume, the risk isn&apos;t the good install — it&apos;s the one photo
          nobody took. Solarsafe turns every install into a defensible record automatically.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {pains.map((p) => (
          <div key={p.before} className="card">
            <p className="text-sm font-semibold text-ink-900">{p.before}</p>
            <div className="my-4 h-px bg-ink-100" />
            <p className="flex items-start gap-2 text-sm text-ink-700">
              <span className="mt-0.5 text-verify-600">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              {p.after}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- FeaturesSection */
const features = [
  {
    id: 'capture',
    icon: CameraGateIcon,
    title: 'Stage-gate capture',
    body: 'Crews can’t advance until every required photo is captured in-app and the Lead confirms the stage. In-app camera only — GPS, timestamp, device and seat ID embedded and hashed.',
  },
  {
    id: 'verification',
    icon: ShieldCheckIcon,
    title: 'AI verification on-site',
    body: 'Claude vision checks each photo against the standard and the job’s equipment specs — PASS, conditional, fail, or unverifiable — with a plain-English rectification note when something’s wrong.',
  },
  {
    id: 'pack',
    icon: DocStackIcon,
    title: 'One canonical evidence pack',
    body: 'Every job assembles a versioned, hash-chained record: photos, serials, test readings, weather. STC agent exports and the compliance pack are thin adapters on top.',
  },
  {
    id: 'lodgement',
    icon: ClipboardTrackIcon,
    title: 'NSW lodgement tracker',
    body: 'DNSP, STC, CCEW and DERR — four obligations, one status board per job. Pre-filled data summaries and deep-links into every portal. eCert-ready for the July 2026 mandate.',
  },
  {
    id: 'telemetry',
    icon: TrendIcon,
    title: 'Crew telemetry',
    body: 'Every gated photo is timestamped, so per-stage durations come for free. Pass-rate dips and speed anomalies surface struggling crews weeks before complaints do.',
  },
  {
    id: 'seats',
    icon: SeatsIcon,
    title: 'Seats & vetted roster',
    body: 'Free global installer identity, company-owned seats by invitation. Licence + SAA accreditation verified against the registers, so you can’t accidentally roster an unaccredited installer.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-ink-50/60 py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <span className="eyebrow">The platform</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            A compliance record and an operations system in one app.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.id} id={f.id} className="card scroll-mt-24 transition hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-solar-400">
                  <Icon />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- GateSection */
function GateSection() {
  return (
    <section className="container-page py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Stage 0 → 10</span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Every install, gated end to end.
        </h2>
        <p className="mt-4 text-lg text-ink-700">
          Sequential, hard-gated where it counts. The pre-start condition survey must be done before
          anyone steps on the roof; termination photos are captured before covers close — the
          invisible-forever defect classes, made permanent.
        </p>
      </div>
      <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STAGES.map((stage) => (
          <li key={stage.key} className="flex gap-4 rounded-xl border border-ink-100 bg-white p-4">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-solar-500/15 text-sm font-bold text-solar-700">
              {stage.index}
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                {stage.title}
                {stage.hardGate && (
                  <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-solar-400">
                    hard gate
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-700">{stage.purpose}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------- OutcomesSection */
function OutcomesSection() {
  const rows = [
    { outcome: 'PASS', meaning: 'Meets the checked criteria', effect: 'Gate credit', tone: 'verify' },
    { outcome: 'CONDITIONAL PASS', meaning: 'Acceptable but flagged', effect: 'Gate credit + dashboard flag', tone: 'solar' },
    { outcome: 'FAIL', meaning: 'Visible non-conformance', effect: 'Blocked · rectification note · re-photo', tone: 'red' },
    { outcome: 'UNVERIFIABLE', meaning: 'Angle/quality insufficient', effect: 'Blocked · re-capture guidance', tone: 'ink' },
  ];
  const dot: Record<string, string> = {
    verify: 'bg-verify-500',
    solar: 'bg-solar-500',
    red: 'bg-red-500',
    ink: 'bg-ink-700',
  };
  return (
    <section id="verification" className="scroll-mt-20 bg-ink-950 py-20 text-white">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="eyebrow text-solar-400">Verification outcomes</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Four verdicts. No install advances on a guess.
          </h2>
          <p className="mt-4 text-ink-100/80">
            Non-compliance calls are protected: crew members capture only. A FAIL stands untouched
            until an accredited Lead closes it against the AI&apos;s re-verification — and the full
            chain is preserved immutably in the job&apos;s non-compliance log.
          </p>
          <p className="mt-4 text-sm text-ink-100/60">
            Reading instrument displays from photos — Voc, insulation resistance, earth continuity —
            makes your test results tamper-evident. That&apos;s the headline differentiator.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-ink-100/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Outcome</th>
                <th className="px-4 py-3 font-semibold">Meaning</th>
                <th className="px-4 py-3 font-semibold">Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.outcome}>
                  <td className="px-4 py-4 font-semibold">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dot[r.tone]}`} />
                      {r.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-ink-100/75">{r.meaning}</td>
                  <td className="px-4 py-4 text-ink-100/75">{r.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- LodgementSection */
function LodgementSection() {
  const lines = [
    { name: 'DNSP connection', detail: 'Approval reference + export limit · verified at Stage 9' },
    { name: 'STC evidence pack', detail: 'Auto-exported to your nominated agent adapter' },
    { name: 'CCEW (eCert)', detail: 'Lead-certified, uploaded in-app · mandatory-digital 2026' },
    { name: 'AEMO DERR', detail: 'Pre-filled from Stage 4/6 capture · reference recorded' },
  ];
  return (
    <section id="lodgement" className="container-page scroll-mt-20 py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="eyebrow">Regulatory lodgement</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Four portals. Four spreadsheets. One tracker.
          </h2>
          <p className="mt-4 text-lg text-ink-700">
            Capture once and feed every channel. NSW is forcibly changing every retailer&apos;s
            paperwork process this year — the ideal moment to consolidate it into a tool that
            pre-fills the data and records every reference against the job.
          </p>
          <Link href="/how-it-works" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-solar-700 hover:text-solar-600">
            See the close-out gate <ArrowIcon />
          </Link>
        </div>
        <div className="card p-2">
          <div className="rounded-xl bg-ink-50 p-4">
            <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-ink-700">
              Job lodgement status
            </p>
            <ul className="space-y-2">
              {lines.map((l, i) => (
                <li key={l.name} className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{l.name}</p>
                    <p className="text-xs text-ink-700">{l.detail}</p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                      i < 2 ? 'bg-verify-500/15 text-verify-700' : 'bg-solar-500/15 text-solar-700'
                    }`}
                  >
                    {i < 2 ? 'Recorded' : 'Pending'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- TelemetrySection */
function TelemetrySection() {
  return (
    <section id="telemetry" className="scroll-mt-20 bg-ink-50/60 py-20">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <div className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">Crew pass-rate × pace</p>
              <span className="text-xs text-ink-700">rolling 6 weeks</span>
            </div>
            <div className="mt-6 flex items-end gap-3">
              {[62, 71, 80, 78, 88, 91].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-solar-500 to-solar-300"
                    style={{ height: `${v}px` }}
                  />
                  <span className="text-[10px] text-ink-700">W{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-verify-500/10 px-3 py-2 text-xs text-verify-700">
              <TrendIcon className="h-4 w-4" />
              First-time pass rate up 29 pts since gating started.
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="eyebrow">Operations lens</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Turn a compliance app into an early-warning system.
          </h2>
          <p className="mt-4 text-lg text-ink-700">
            First-time pass rate is the headline metric — never a raw speed leaderboard, because
            rewarding speed manufactures the corner-cutting the gates exist to prevent. Durations are
            job-mix normalised, so double-storey tile isn&apos;t judged against single-storey tin.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- SeatsSection */
function SeatsSection() {
  return (
    <section className="container-page py-20">
      <div className="rounded-3xl bg-ink-900 px-6 py-14 text-white sm:px-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="eyebrow text-solar-400">Accounts & seats</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Onboard 200 subbies in a week.
            </h2>
            <p className="mt-4 text-ink-100/80">
              Installer onboarding for a new company is a push-notification accept — not an account
              creation. One login per human; a subbie working for two retailers is two billed seats,
              one app. Evidence is firewalled absolutely between companies.
            </p>
          </div>
          <ul className="grid gap-3">
            {[
              'Vetted qualification set — licence + SAA, verified against the registers',
              'Lead eligibility enforced and job-type aware (battery endorsement gated)',
              'Deactivated seats keep all history — evidence never leaves your account',
              'Live roster: invited / active / deactivated, accreditation status, pass rates',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-ink-100/90">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-none text-verify-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ PricingPreview */
function PricingPreview() {
  return (
    <section className="bg-ink-50/60 py-20">
      <div className="container-page text-center">
        <span className="eyebrow">Pricing</span>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Seats, not surprises. No per-job pricing.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-700">
          The employer dashboard is free and unlimited. You pay per active seat, with a fair-use job
          cap per tier. The installer app is a free login shell.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/pricing" className="btn-dark">
            See pricing <ArrowIcon />
          </Link>
          <Link href="#demo" className="btn-ghost">
            Book a demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- DemoSection */
function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-20 bg-ink-950 py-20 text-white">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <span className="eyebrow text-solar-400">Book a demo</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            See a real pilot job — not a canned deck.
          </h2>
          <p className="mt-4 max-w-md text-ink-100/80">
            We&apos;ll walk you through an actual gated install: the capture flow, an AI FAIL and its
            rectification, the compliance pack, and the lodgement tracker. Then we&apos;ll talk about
            your crews.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-100/85">
            {[
              'One business-day response',
              'Built and piloting in NSW',
              'Evidence firewall + append-only integrity by design',
            ].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-solar-400" />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-ink-900">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
