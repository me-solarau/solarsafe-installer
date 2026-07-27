import Link from 'next/link';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-4 text-sm text-ink-100/70">
            Stage-gate photo verification for grid-connected rooftop PV. Photograph once, prove
            compliance forever.
          </p>
        </div>
        <FooterCol
          title="Platform"
          links={[
            { href: '/#features', label: 'Stage-gate capture' },
            { href: '/#verification', label: 'AI verification' },
            { href: '/#lodgement', label: 'Lodgement tracker' },
            { href: '/#telemetry', label: 'Crew telemetry' },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: '/how-it-works', label: 'How it works' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/#demo', label: 'Book a demo' },
          ]}
        />
        <FooterCol
          title="For installers"
          links={[
            { href: '/dashboard', label: 'Dashboard sign in' },
            { href: '/#demo', label: 'Get the app' },
          ]}
        />
      </div>
      <div className="border-t border-white/5">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-ink-100/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Solarsafe Installer. Built for NSW solar retailers.</p>
          <p>Evidence integrity: append-only, supersede-never-replace.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-100/50">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-ink-100/80 transition hover:text-solar-400">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
