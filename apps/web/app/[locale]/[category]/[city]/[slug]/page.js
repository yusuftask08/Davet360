import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCategoryBySlug, AMENITIES } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { Card, Badge, VendorCard, Check, Star } from '@repo/ui';
import { LeadForm } from './LeadForm.jsx';
import { VendorMapLazy } from './VendorMapLazy.jsx';
import { ReviewForm } from './ReviewForm.jsx';
import { WhatsAppButton } from './WhatsAppButton.jsx';
import { FavoriteButton } from '../../../components/FavoriteButton.jsx';
import { CardFavoriteButton } from '../../../components/CardFavoriteButton.jsx';
import { Breadcrumb } from '../../../components/Breadcrumb.jsx';
import { Link } from '../../../../../i18n/navigation.js';
import { buildAlternates, buildOpenGraph, buildTwitter } from '../../../lib/seo.js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3600';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

async function fetchVendor(slug) {
  try {
    const data = await apiClient.get(ENDPOINTS.vendorBySlug(slug));
    return data.vendor;
  } catch {
    return null;
  }
}

async function fetchReviews(vendorId) {
  try {
    const data = await apiClient.get(ENDPOINTS.vendorReviews(vendorId));
    return data.items;
  } catch {
    return [];
  }
}

async function fetchSimilarVendors(category, citySlug, excludeId) {
  try {
    const data = await apiClient.get(`${ENDPOINTS.vendors}?category=${category}&citySlug=${citySlug}&limit=5`);
    return data.items.filter((vendor) => vendor._id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

// URL'in kategori/şehir segmentleri vendor'ın gerçek kategori/citySlug'ıyla eşleşmezse 404 —
// aynı işletme farklı bir kategori/şehir path'inde de "geçerli" görünmesin (duplicate content).
function matchesUrl(vendor, params) {
  return vendor.category === params.category && vendor.citySlug === params.city;
}

export async function generateMetadata({ params }) {
  const vendor = await fetchVendor(params.slug);
  if (!vendor || !matchesUrl(vendor, params)) return {};

  const title = vendor.seoTitle || `${vendor.businessName} - ${vendor.city}`;
  const description = vendor.seoDescription || vendor.description?.slice(0, 155);
  const path = `/${params.category}/${params.city}/${vendor.slug}`;
  const images = vendor.images?.[0] ? [apiClient.assetUrl(vendor.images[0])] : undefined;

  return {
    title,
    description,
    alternates: buildAlternates(params.locale, path),
    openGraph: buildOpenGraph(params.locale, { title: vendor.businessName, description, images }),
    twitter: buildTwitter({ title: vendor.businessName, description, images }),
  };
}

export default async function VendorPage({ params }) {
  setRequestLocale(params.locale);
  const category = getCategoryBySlug(params.category);
  const vendor = await fetchVendor(params.slug);
  if (!category || !vendor || !matchesUrl(vendor, params)) notFound();

  const [t, reviews, similarVendors] = await Promise.all([
    getTranslations(),
    fetchReviews(vendor._id),
    fetchSimilarVendors(params.category, params.city, vendor._id),
  ]);
  const categoryLabel = t(`categories.${params.category}`);
  const [lng, lat] = vendor.location?.coordinates ?? [];

  const vendorPath = `${SITE_URL}/${params.locale}/${params.category}/${params.city}/${vendor.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.businessName,
    description: vendor.description,
    url: vendorPath,
    ...(vendor.images?.length ? { image: vendor.images.map(apiClient.assetUrl) } : {}),
    ...(vendor.whatsapp ? { telephone: vendor.whatsapp } : {}),
    address: { '@type': 'PostalAddress', addressLocality: vendor.city, addressCountry: 'TR' },
    ...(lat && lng ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } } : {}),
    ...(vendor.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: vendor.avgRating,
            reviewCount: vendor.reviewCount,
          },
        }
      : {}),
  };

  return (
    <main className="container page-main vendor-page">
      {/* JSON-LD için tek istisna: ham HTML değil, JSON veri gömülüyor; script türü
          application/ld+json olduğu için tarayıcı bunu asla çalıştırmaz. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Breadcrumb
        locale={params.locale}
        items={[
          { name: 'Merasim360', href: '' },
          { name: categoryLabel, href: `/${params.category}` },
          { name: vendor.city, href: `/${params.category}/${params.city}` },
          { name: vendor.businessName, href: `/${params.category}/${params.city}/${vendor.slug}` },
        ]}
      />

      {(() => {
        const images = vendor.images ?? [];
        const isSingle = images.length <= 1;
        const thumbs = images.slice(1, 5);
        const extraCount = images.length - 5;
        return (
          <div className={`vendor-hero ${isSingle ? 'vendor-hero--single' : ''}`}>
            <div className="vendor-hero__main">
              {images[0] && (
                <Image
                  src={apiClient.assetUrl(images[0])}
                  alt={vendor.businessName}
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 60vw"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
            {!isSingle && (
              <div className="vendor-hero__thumbs">
                {thumbs.map((image, index) => (
                  <div key={image} className="vendor-hero__thumb">
                    <Image
                      src={apiClient.assetUrl(image)}
                      alt={`${vendor.businessName} ${index + 2}`}
                      fill
                      sizes="25vw"
                      style={{ objectFit: 'cover' }}
                    />
                    {index === thumbs.length - 1 && extraCount > 0 && (
                      <div className="vendor-hero__thumb-more">+{extraCount}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <div className="vendor-detail-grid">
        <div>
          <div className="vendor-header__badges">
            <Badge variant="accent">{categoryLabel}</Badge>
            {/* Bu sayfaya ulaşan her vendor zaten backend'de onaylı filtresinden geçmiştir. */}
            <Badge variant="success">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
              {t('vendor.verified')}
            </Badge>
          </div>
          <h1 className="vendor-header__title">{vendor.businessName}</h1>
          <p className="vendor-header__city">{vendor.city}</p>

          <div className="vendor-header__stats">
            {vendor.reviewCount > 0 && (
              <Badge>
                <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                {vendor.avgRating.toFixed(1)} ({vendor.reviewCount})
              </Badge>
            )}
            {vendor.capacity && <Badge>{t('vendor.capacity', { count: vendor.capacity })}</Badge>}
          </div>

          <p className="vendor-description">{vendor.description}</p>

          <div className="vendor-actions">
            {/* Mobilde teklif formu (aside) DOM'da en sonda kalıyor — sayfa sırası galeri/
                olanaklar/harita/yorumlar bittikten sonra geliyor. Masaüstünde aside zaten
                sticky ve görünür olduğu için bu buton sadece mobilde çıkar, tıklanınca
                forma kaydırır — kullanıcı teklif almak için tüm sayfayı kaydırmak zorunda
                kalmasın. */}
            <a href="#lead-form" className="ui-button ui-button--primary vendor-mobile-cta">
              {t('vendor.getQuote')}
            </a>
            <WhatsAppButton whatsapp={vendor.whatsapp} />
            <FavoriteButton vendorId={vendor._id} />
          </div>

          {vendor.amenities?.length > 0 && (
            <div className="vendor-section">
              <h2 className="vendor-section__heading">{t('vendor.amenitiesHeading')}</h2>
              <div className="vendor-amenities">
                {vendor.amenities.map((key) => {
                  const amenity = AMENITIES.find((a) => a.key === key);
                  if (!amenity) return null;
                  return (
                    <Badge key={key}>
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                      {amenity.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {lat && lng && (
            <div className="vendor-section">
              <h2 className="vendor-section__heading">{t('vendor.locationHeading')}</h2>
              <VendorMapLazy lat={lat} lng={lng} name={vendor.businessName} />
            </div>
          )}

          <div className="vendor-section">
            <h2 className="vendor-section__heading">{t('vendor.reviewsHeading')}</h2>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-neutral-500)' }}>{t('vendor.noReviews')}</p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                {reviews.map((review) => (
                  <Card key={review._id} className="vendor-review-card">
                    <div className="vendor-review-card__meta">
                      <strong>{review.userId?.name ?? '—'}</strong>
                      <span className="vendor-review-card__rating">
                        <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                        {review.rating}
                      </span>
                    </div>
                    <p className="vendor-review-card__comment">{review.comment}</p>
                  </Card>
                ))}
              </div>
            )}
            <ReviewForm vendorId={vendor._id} />
          </div>
        </div>

        <aside id="lead-form" className="vendor-detail-aside">
          <Card>
            <h2 className="vendor-quote-card__heading">{t('vendor.getQuote')}</h2>
            <LeadForm vendorId={vendor._id} />
          </Card>
        </aside>
      </div>

      {similarVendors.length > 0 && (
        <section style={{ marginTop: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{t('vendor.similarHeading')}</h2>
          <div className="vendor-grid">
            {similarVendors.map((similar) => (
              <VendorCard
                key={similar._id}
                vendor={{ ...similar, images: (similar.images ?? []).map(apiClient.assetUrl) }}
                categoryLabel={categoryLabel}
                verifiedLabel={t('vendor.verified')}
                highlyRatedLabel={t('vendor.highlyRated')}
                as={Link}
                href={`/${params.category}/${params.city}/${similar.slug}`}
                favorite={<CardFavoriteButton vendorId={similar._id} />}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
