import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wrapper config for the installer app.
 * iOS is built via Codemagic CI/CD (no Mac); Android direct.
 * `webDir` points at the Next.js static export output.
 */
const config: CapacitorConfig = {
  appId: 'installer.solarsafe.app',
  appName: 'Solarsafe Installer',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
