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
    apiClient.get(`${ENDPOINTS.vendorTopCities}?limit=4`).catch(() => ({ items: [] })),
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

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Davet360',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Davet360',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/${locale}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [1, 2, 3, 4, 5].map((n) => ({
      '@type': 'Question',
      name: t(`faq.q${n}`),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq.a${n}`) },
    })),
  };

  return (
    <main className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <h1 className="sr-only">{t('home.title')}</h1>

      <nav className="category-strip" aria-label={t('home.categoriesHeading')} style={{ marginTop: 'var(--space-lg)' }}>
        {CATEGORIES.map((category) => (
          <Link key={category.slug} href={`/${category.slug}`} className="category-strip__item">
            <CategoryIcon slug={category.slug} size={24} strokeWidth={1.5} />
            <span>{t(`categories.${category.slug}`)}</span>
          </Link>
        ))}
      </nav>

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

      <section style={{ marginTop: 'var(--space-3xl)', marginBottom: 'var(--space-3xl)' }}>
        <div className="section-heading section-heading--lg">
          <h2>{t('home.faqHeading')}</h2>
        </div>
        <div className="faq-list">
          {[1, 2, 3, 4, 5].map((n) => (
            <details key={n} className="faq-list__item">
              <summary>{t(`faq.q${n}`)}</summary>
              <p>{t(`faq.a${n}`)}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
