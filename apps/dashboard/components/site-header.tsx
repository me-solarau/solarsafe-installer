import Link from 'next/link';
import { Logo } from './logo';

const nav = [
  { href: '/#features', label: 'Platform' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label="Solarsafe Installer home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-700 transition hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-ink-700 hover:text-ink-900 sm:inline">
            Sign in
          </Link>
          <Link href="/#demo" className="btn-primary">
            Book a demo
          </Link>
        </div>
      </div>
    </header>
  );
}
