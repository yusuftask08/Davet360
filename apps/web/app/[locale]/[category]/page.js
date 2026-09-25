import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CATEGORIES, getCategoryBySlug } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { VendorCard, CategoryIcon, ScrollRow } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { EmptyStateCta } from '../components/EmptyStateCta.jsx';
import { CardFavoriteButton } from '../components/CardFavoriteButton.jsx';
import { buildAlternates } from '../lib/seo.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

export async function generateMetadata({ params: { category: categorySlug, locale } }) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  const t = await getTranslations({ locale });
  const label = t(`categories.${categorySlug}`);

  return {
    title: label,
    description: t(`categoryIntros.${categorySlug}`),
    alternates: buildAlternates(locale, `/${categorySlug}`),
  };
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug, locale } = params;
  setRequestLocale(locale);
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const t = await getTranslations();
  const categoryLabel = t(`categories.${categorySlug}`);
  const otherCategories = CATEGORIES.filter((c) => c.slug !== categorySlug);

  const [cities, vendors] = await Promise.all([
    apiClient.get(`${ENDPOINTS.vendorCities}?category=${categorySlug}`).catch(() => ({ items: [] })),
    apiClient.get(`${ENDPOINTS.vendors}?category=${categorySlug}&limit=24`).catch(() => ({ items: [] })),
  ]);

  return (
    <main className="container page-main">
      <Breadcrumb locale={locale} items={[{ name: 'Merasim360', href: '' }, { name: categoryLabel, href: `/${categorySlug}` }]} />
      <header className="page-header">
        <h1 className="page-header__title">{categoryLabel}</h1>
        <p className="page-header__meta">{t('category.nationwide')}</p>
        <p className="page-header__intro">{t(`categoryIntros.${categorySlug}`)}</p>
      </header>

      {cities.items.length > 0 && (
        <section className="city-picker">
          <h2 className="city-picker__heading">{t('category.pickCity')}</h2>
          <div className="city-picker__list">
            {cities.items.map((cityItem) => (
              <Link key={cityItem.citySlug} href={`/${categorySlug}/${cityItem.citySlug}`} className="city-picker__chip">
                {cityItem.city}
                <span className="city-picker__count">{cityItem.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {vendors.items.length === 0 ? (
        <EmptyStateCta />
      ) : (
        <div className="vendor-grid">
          {vendors.items.map((vendor) => (
            <VendorCard
              key={vendor._id}
              vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
              categoryLabel={categoryLabel}
              verifiedLabel={t('vendor.verified')}
              highlyRatedLabel={t('vendor.highlyRated')}
              as={Link}
              href={`/${categorySlug}/${vendor.citySlug}/${vendor.slug}`}
              favorite={<CardFavoriteButton vendorId={vendor._id} />}
            />
          ))}
        </div>
      )}

      {otherCategories.length > 0 && (
        <section className="home-section">
          <div className="section-heading section-heading--lg">
            <h2>{t('category.otherCategoriesHeading')}</h2>
          </div>
          <ScrollRow prevLabel={t('common.scrollPrev')} nextLabel={t('common.scrollNext')}>
            {otherCategories.map((other) => (
              <Link key={other.slug} href={`/${other.slug}`} className="hscroll__item category-circle">
                <span className="category-circle__icon">
                  <CategoryIcon slug={other.slug} size={28} strokeWidth={1.5} />
                </span>
                <span className="category-circle__label">{t(`categories.${other.slug}`)}</span>
              </Link>
            ))}
          </ScrollRow>
        </section>
      )}
    </main>
  );
}
