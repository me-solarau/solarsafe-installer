import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://solarsafe.installer'),
  title: {
    default: 'Solarsafe Installer — photograph once, prove compliance forever',
    template: '%s · Solarsafe Installer',
  },
  description:
    'Stage-gate photo verification for rooftop solar. AI-verified evidence, STC-ready packs, and every NSW lodgement tracked in one app — built for retailers running subbie crews at volume.',
  openGraph: {
    title: 'Solarsafe Installer',
    description:
      'Stage-gate photo verification for rooftop solar. Catch defects before the customer does.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
