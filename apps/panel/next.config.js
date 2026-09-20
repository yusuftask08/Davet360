/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/api-client', '@repo/constants', '@repo/utils'],
};

export default nextConfig;
