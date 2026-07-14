import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solarsafe Installer — Field App',
  description: 'Stage-gate capture app for installers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
