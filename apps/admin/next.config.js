/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Docker imajı için — sadece çalışma zamanında gereken minimal dosya seti üretir.
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/api-client', '@repo/constants', '@repo/utils'],
  // Admin app en yüksek yetkili işlemleri barındırıyor — X-Frame-Options burada özellikle
  // önemli çünkü bu app hiçbir yerde iframe içine alınmamalı.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
