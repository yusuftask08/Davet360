import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { VendorCard } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

// Sonuç sayfası sorguya göre değişir, kalıcı bir SEO landing page değil — indexlenmez.
export const metadata = { robots: { index: false, follow: true } };

export default async function SearchPage({ params: { locale }, searchParams }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const query = searchParams?.q?.trim() ?? '';

  const data = query
    ? await apiClient.get(`${ENDPOINTS.vendors}?search=${encodeURIComponent(query)}&limit=48`).catch(() => ({ items: [] }))
    : { items: [] };

  return (
    <main className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      {!query ? (
        <p style={{ color: 'var(--color-neutral-500)' }}>{t('search.noQuery')}</p>
      ) : (
        <>
          <div className="section-heading">
            <h1 style={{ fontSize: 'var(--font-size-xl)' }}>{t('search.heading', { query })}</h1>
            <span className="section-heading__meta">
              {t('search.resultsCount', { count: data.total ?? data.items.length })}
            </span>
          </div>

          {data.items.length === 0 ? (
            <p style={{ color: 'var(--color-neutral-500)' }}>{t('search.empty')}</p>
          ) : (
            <div className="vendor-grid">
              {data.items.map((vendor) => (
                <VendorCard
                  key={vendor._id}
                  vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
                  categoryLabel={t(`categories.${vendor.category}`)}
                  verifiedLabel={t('vendor.verified')}
                  as={Link}
                  href={`/${vendor.category}/${vendor.citySlug}/${vendor.slug}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
