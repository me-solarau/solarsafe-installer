/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile the shared workspace package (it ships raw TS).
  transpilePackages: ['@solarsafe/shared'],
};

export default nextConfig;
