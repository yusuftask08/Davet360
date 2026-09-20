/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Docker imajı için — sadece çalışma zamanında gereken minimal dosya seti üretir.
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/api-client', '@repo/constants', '@repo/utils'],
};

export default nextConfig;
