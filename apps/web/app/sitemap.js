import { CATEGORIES } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { routing } from '../i18n/routing.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

function withLocaleAlternates(path) {
  return {
    url: `${siteUrl}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`])),
    },
  };
}

// Sadece onaylı vendor'ları olan kategori+şehir kombinasyonları ve yayınlanmış blog yazıları
// sitemap'e girer — thin/boş SEO sayfası hiç üretilmez.
export default async function sitemap() {
  const staticRoutes = [
    withLocaleAlternates(''),
    withLocaleAlternates('/blog'),
    withLocaleAlternates('/about'),
    withLocaleAlternates('/contact'),
    withLocaleAlternates('/privacy'),
    withLocaleAlternates('/terms'),
  ];

  const categoryRoutes = await Promise.all(
    CATEGORIES.map(async (category) => {
      const routes = [withLocaleAlternates(`/${category.slug}`)];

      const cities = await apiClient
        .get(`${ENDPOINTS.vendorCities}?category=${category.slug}`)
        .catch(() => ({ items: [] }));

      for (const cityItem of cities.items) {
        routes.push(withLocaleAlternates(`/${category.slug}/${cityItem.citySlug}`));
      }

      const vendors = await apiClient
        .get(`${ENDPOINTS.vendors}?category=${category.slug}&limit=100`)
        .catch(() => ({ items: [] }));

      for (const vendor of vendors.items) {
        routes.push(withLocaleAlternates(`/${category.slug}/${vendor.citySlug}/${vendor.slug}`));
      }

      return routes;
    }),
  );

  const blogData = await apiClient.get(ENDPOINTS.blogList).catch(() => ({ items: [] }));
  const blogRoutes = blogData.items.map((post) => withLocaleAlternates(`/blog/${post.slug}`));

  return [...staticRoutes, ...categoryRoutes.flat(), ...blogRoutes];
}
