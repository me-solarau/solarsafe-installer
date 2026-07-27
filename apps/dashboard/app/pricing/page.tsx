import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowIcon, ShieldCheckIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Per-seat pricing with a fair-use job cap. Free unlimited employer dashboard, free installer app. No per-job pricing, no in-app purchases.',
};

const tiers = [
  {
    name: 'Starter',
    tagline: 'Single crew or owner-operator',
    price: 'Talk to us',
    highlight: false,
    features: [
      'Up to 5 active seats',
      'Full stage-gate capture (Stage 0 → 10)',
      'AI verification + rectification flow',
      'Compliance pack + STC evidence export',
      'NSW lodgement tracker (DNSP / STC / CCEW / DERR)',
    ],
  },
  {
    name: 'Volume',
    tagline: 'Retailers running subbie crews',
    price: 'Talk to us',
    highlight: true,
    features: [
      'Everything in Starter',
      'Unlimited employer dashboard users',
      'Vetted roster + register verification',
      'Crew telemetry & pass-rate analytics',
      'Multi-agent STC export adapters',
      'Priority onboarding — 200 subbies in a week',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'Multi-brand & national',
    price: 'Custom',
    highlight: false,
    features: [
      'Everything in Volume',
      'Custom fair-use job caps',
      'Design-tool import (Pylon / OpenSolar)',
      'SPV App Provider readiness pathway',
      'Dedicated support & SLA',
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-ink-950 py-16 text-white">
        <div className="container-page text-center">
          <span className="eyebrow text-solar-400">Pricing</span>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Pay per seat. Nothing per job.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-100/80">
            A seat is an active company↔installer link — billing starts when an installer accepts,
            stops when you deactivate. The dashboard is free and unlimited; the installer app is a
            free login shell. Billing is web-only (never in-app purchases).
          </p>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                tier.highlight
                  ? 'border-solar-500 bg-white shadow-card ring-1 ring-solar-500/30'
                  : 'border-ink-100 bg-white shadow-card'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-solar-500 px-3 py-1 text-xs font-semibold text-ink-900">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-ink-900">{tier.name}</h2>
              <p className="mt-1 text-sm text-ink-700">{tier.tagline}</p>
              <p className="mt-5 text-3xl font-bold tracking-tight text-ink-900">{tier.price}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <ShieldCheckIcon className="mt-0.5 h-5 w-5 flex-none text-verify-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/#demo"
                className={`mt-8 ${tier.highlight ? 'btn-primary' : 'btn-dark'} w-full`}
              >
                Book a demo <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-ink-700">
          Final seat pricing and fair-use job caps are set with real per-job photo counts from the
          pilot. Want a number for your crew count?{' '}
          <Link href="/#demo" className="font-semibold text-solar-700 hover:text-solar-600">
            Book a demo
          </Link>{' '}
          and we&apos;ll model it with you.
        </p>
      </section>
    </>
  );
}
