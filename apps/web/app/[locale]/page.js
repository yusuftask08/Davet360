import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CATEGORIES, getCategoryBySlug } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { toLocativeCase } from '@repo/utils';
import { CategoryIcon, VendorCard } from '@repo/ui';
import { Link } from '../../i18n/navigation.js';
import { CardFavoriteButton } from './components/CardFavoriteButton.jsx';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3600';

export default async function HomePage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  const [featured, topCities] = await Promise.all([
    apiClient.get(`${ENDPOINTS.vendorFeatured}?limit=6`).catch(() => ({ items: [] })),
    apiClient.get(`${ENDPOINTS.vendorTopCities}?limit=8`).catch(() => ({ items: [] })),
  ]);

  // Airbnb'deki "X yakınlarındaki popüler evler" satırları gibi — en çok işletmesi olan
  // şehirler için ayrı ayrı satır. Sadece gerçek onaylı vendor'ı olan şehirler kullanılır.
  const cityRows = await Promise.all(
    topCities.items.map((cityItem) =>
      apiClient
        .get(`${ENDPOINTS.vendors}?citySlug=${cityItem.citySlug}&limit=10`)
        .then((data) => ({ city: cityItem.city, citySlug: cityItem.citySlug, items: data.items }))
        .catch(() => ({ city: cityItem.city, citySlug: cityItem.citySlug, items: [] })),
    ),
  );

  // Airbnb'nin "Yakınlardaki deneyimleri keşfedin" kategori kartları satırı gibi — en çok
  // işletmesi olan şehir varsa o şehre, yoksa genel kategori sayfasına yönlendirir.
  const browseCity = topCities.items[0] ?? null;

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Merasim360',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Merasim360',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/${locale}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <main className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      <h1 className="sr-only">{t('home.title')}</h1>

      {featured.items.length > 0 && (
        <section style={{ marginTop: 'var(--space-3xl)' }}>
          <div className="section-heading section-heading--lg">
            <h2>{t('home.featuredHeading')}</h2>
          </div>
          <div className="hscroll">
            {featured.items.map((vendor, i) => {
              const category = getCategoryBySlug(vendor.category);
              return (
                <VendorCard
                  key={vendor._id}
                  vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
                  categoryLabel={category ? t(`categories.${category.slug}`) : undefined}
                  verifiedLabel={t('vendor.verified')}
                  highlyRatedLabel={t('vendor.highlyRated')}
                  as={Link}
                  href={`/${vendor.category}/${vendor.citySlug}/${vendor.slug}`}
                  className="hscroll__item hscroll__item--vendor"
                  favorite={<CardFavoriteButton vendorId={vendor._id} />}
                  priority={i < 2}
                />
              );
            })}
          </div>
        </section>
      )}

      <section style={{ marginTop: 'var(--space-3xl)' }}>
        <div className="section-heading section-heading--lg">
          <h2>
            {browseCity
              ? t('home.categoryBrowseHeading', {
                  city: locale === 'tr' ? toLocativeCase(browseCity.city) : browseCity.city,
                })
              : t('home.categoryBrowseHeadingGeneric')}
          </h2>
        </div>
        <div className="hscroll">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={browseCity ? `/${category.slug}/${browseCity.citySlug}` : `/${category.slug}`}
              className="hscroll__item category-browse-card"
            >
              <span className="category-browse-card__icon">
                <CategoryIcon slug={category.slug} size={26} strokeWidth={1.5} />
              </span>
              <span className="category-browse-card__label">{t(`categories.${category.slug}`)}</span>
            </Link>
          ))}
        </div>
      </section>

      {cityRows
        .filter((row) => row.items.length > 0)
        .map((row) => (
          <section key={row.citySlug} style={{ marginTop: 'var(--space-3xl)' }}>
            <div className="section-heading section-heading--lg">
              <h2>{t('home.cityRowHeading', { city: locale === 'tr' ? toLocativeCase(row.city) : row.city })}</h2>
            </div>
            <div className="hscroll">
              {row.items.map((vendor) => {
                const category = getCategoryBySlug(vendor.category);
                return (
                  <VendorCard
                    key={vendor._id}
                    vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
                    categoryLabel={category ? t(`categories.${category.slug}`) : undefined}
                    verifiedLabel={t('vendor.verified')}
                    highlyRatedLabel={t('vendor.highlyRated')}
                    as={Link}
                    href={`/${vendor.category}/${vendor.citySlug}/${vendor.slug}`}
                    className="hscroll__item hscroll__item--vendor"
                    favorite={<CardFavoriteButton vendorId={vendor._id} />}
                  />
                );
              })}
            </div>
          </section>
        ))}
    </main>
  );
}
