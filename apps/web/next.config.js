import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

// Upload edilen vendor/blog görselleri apps/api'nin kök domaininden servis edilir —
// next/image'ın bu host'tan optimize edebilmesi için remotePatterns'a eklenmesi gerekir.
function getApiOrigin() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api');
    return { protocol: url.protocol.replace(':', ''), hostname: url.hostname, port: url.port };
  } catch {
    return { protocol: 'http', hostname: 'localhost', port: '4000' };
  }
}

const apiOrigin = getApiOrigin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Docker imajı için — sadece çalışma zamanında gereken minimal dosya seti üretir.
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/api-client', '@repo/constants', '@repo/utils'],
  images: {
    remotePatterns: [
      { protocol: apiOrigin.protocol, hostname: apiOrigin.hostname, port: apiOrigin.port },
    ],
  },
  // apps/api zaten helmet ile korunuyor ama bu başlıklar sadece API yanıtlarına uygulanır —
  // Next.js'in kendi sunduğu HTML sayfaları (asıl kullanıcı yüzü) hariç kalıyordu.
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

export default withNextIntl(nextConfig);
