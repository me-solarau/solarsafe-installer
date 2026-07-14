import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solarsafe Installer — Dashboard',
  description: 'Employer dashboard for stage-gate solar install verification.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
