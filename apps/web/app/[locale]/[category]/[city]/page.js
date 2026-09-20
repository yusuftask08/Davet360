import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCategoryBySlug } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { VendorCard, Input, Button } from '@repo/ui';
import { Link } from '../../../../i18n/navigation.js';
import { Breadcrumb } from '../../components/Breadcrumb.jsx';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

async function fetchCityInfo(category, citySlug) {
  const data = await apiClient.get(`${ENDPOINTS.vendorCities}?category=${category}`).catch(() => ({ items: [] }));
  return data.items.find((item) => item.citySlug === citySlug) ?? null;
}

export async function generateMetadata({ params: { category: categorySlug, city: citySlug, locale } }) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  const cityInfo = await fetchCityInfo(categorySlug, citySlug);
  const cityName = cityInfo?.city ?? citySlug;
  const t = await getTranslations({ locale, namespace: 'categories' });
  const label = t(categorySlug);

  return {
    title: `${cityName} ${label}`,
    description:
      locale === 'en'
        ? `Compare verified ${label} vendors in ${cityName} and request a free quote.`
        : `${cityName} bölgesinde onaylı ${label} tedarikçilerini karşılaştırın, ücretsiz teklif alın.`,
    alternates: { canonical: `/${locale}/${categorySlug}/${citySlug}` },
  };
}

export default async function CategoryCityPage({ params, searchParams }) {
  const { category: categorySlug, city: citySlug, locale } = params;
  setRequestLocale(locale);
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const t = await getTranslations();
  const categoryLabel = t(`categories.${categorySlug}`);
  const { maxBudget, minCapacity } = searchParams ?? {};

  const query = new URLSearchParams({ category: categorySlug, citySlug });
  if (maxBudget) query.set('maxBudget', maxBudget);
  if (minCapacity) query.set('minCapacity', minCapacity);

  const [cityInfo, data] = await Promise.all([
    fetchCityInfo(categorySlug, citySlug),
    apiClient.get(`${ENDPOINTS.vendors}?${query.toString()}`).catch(() => ({ items: [] })),
  ]);

  if (!cityInfo && data.items.length === 0 && !maxBudget && !minCapacity) notFound();
  const cityName = cityInfo?.city ?? citySlug;

  return (
    <main className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <Breadcrumb
        locale={locale}
        items={[
          { name: 'Davet360', href: '' },
          { name: categoryLabel, href: `/${categorySlug}` },
          { name: cityName, href: `/${categorySlug}/${citySlug}` },
        ]}
      />
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--font-size-xl)' }}>
          {cityName} {categoryLabel}
        </h1>
        <span className="section-heading__meta">
          {t('category.vendorCount', { count: data.total ?? data.items.length })}
        </span>
      </div>

      <p style={{ marginBottom: 'var(--space-lg)' }}>
        <Link href={`/${categorySlug}`} style={{ color: 'var(--color-neutral-500)' }}>
          ← {t('category.allCities', { category: categoryLabel })}
        </Link>
      </p>

      <form
        method="get"
        style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'end', marginBottom: 'var(--space-xl)' }}
      >
        <div style={{ maxWidth: 180 }}>
          <Input
            name="maxBudget"
            type="number"
            min="0"
            label={t('category.maxBudgetLabel')}
            defaultValue={maxBudget ?? ''}
          />
        </div>
        <div style={{ maxWidth: 160 }}>
          <Input
            name="minCapacity"
            type="number"
            min="0"
            label={t('category.minCapacityLabel')}
            defaultValue={minCapacity ?? ''}
          />
        </div>
        <Button type="submit" variant="secondary">
          {t('category.filterButton')}
        </Button>
      </form>

      {data.items.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-500)' }}>{t('category.empty')}</p>
      ) : (
        <div className="vendor-grid">
          {data.items.map((vendor) => (
            <VendorCard
              key={vendor._id}
              vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
              categoryLabel={categoryLabel}
              verifiedLabel={t('vendor.verified')}
              as={Link}
              href={`/${categorySlug}/${citySlug}/${vendor.slug}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
