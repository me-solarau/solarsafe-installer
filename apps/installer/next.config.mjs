/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@solarsafe/shared'],
  // Static export so the app can be wrapped by Capacitor into a native shell.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
