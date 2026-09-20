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
  transpilePackages: ['@repo/ui', '@repo/api-client', '@repo/constants', '@repo/utils'],
  images: {
    remotePatterns: [
      { protocol: apiOrigin.protocol, hostname: apiOrigin.hostname, port: apiOrigin.port },
    ],
  },
};

export default withNextIntl(nextConfig);
