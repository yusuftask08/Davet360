import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCategoryBySlug, AMENITIES } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { Card, Badge, VendorCard, Check, Star } from '@repo/ui';
import { LeadForm } from './LeadForm.jsx';
import { ReviewForm } from './ReviewForm.jsx';
import { VendorMap } from './VendorMap.jsx';
import { WhatsAppButton } from './WhatsAppButton.jsx';
import { FavoriteButton } from '../../../components/FavoriteButton.jsx';
import { CardFavoriteButton } from '../../../components/CardFavoriteButton.jsx';
import { Breadcrumb } from '../../../components/Breadcrumb.jsx';
import { Link } from '../../../../../i18n/navigation.js';

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

  return {
    title: vendor.seoTitle || `${vendor.businessName} - ${vendor.city}`,
    description: vendor.seoDescription || vendor.description?.slice(0, 155),
    alternates: { canonical: `/${params.locale}/${params.category}/${params.city}/${vendor.slug}` },
    openGraph: {
      title: vendor.businessName,
      description: vendor.description?.slice(0, 155),
      images: vendor.images?.[0] ? [apiClient.assetUrl(vendor.images[0])] : undefined,
    },
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.businessName,
    description: vendor.description,
    address: { '@type': 'PostalAddress', addressLocality: vendor.city, addressCountry: 'TR' },
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
    <main
      className="container"
      style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}
    >
      {/* JSON-LD için tek istisna: ham HTML değil, JSON veri gömülüyor; script türü
          application/ld+json olduğu için tarayıcı bunu asla çalıştırmaz. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Breadcrumb
        locale={params.locale}
        items={[
          { name: 'Davet360', href: '' },
          { name: categoryLabel, href: `/${params.category}` },
          { name: vendor.city, href: `/${params.category}/${params.city}` },
          { name: vendor.businessName, href: `/${params.category}/${params.city}/${vendor.slug}` },
        ]}
      />

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          background: vendor.images?.[0] ? undefined : 'var(--gradient-hero)',
          aspectRatio: '16 / 6',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {vendor.images?.[0] && (
          <Image
            src={apiClient.assetUrl(vendor.images[0])}
            alt={vendor.businessName}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>

      <div className="vendor-detail-grid">
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
            <Badge variant="accent">{categoryLabel}</Badge>
            {/* Bu sayfaya ulaşan her vendor zaten backend'de onaylı filtresinden geçmiştir. */}
            <Badge variant="success">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
              {t('vendor.verified')}
            </Badge>
          </div>
          <h1 style={{ margin: 'var(--space-sm) 0 4px' }}>{vendor.businessName}</h1>
          <p style={{ color: 'var(--color-neutral-500)', margin: 0 }}>{vendor.city}</p>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
            {vendor.reviewCount > 0 && (
              <Badge>
                <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                {vendor.avgRating.toFixed(1)} ({vendor.reviewCount})
              </Badge>
            )}
            {vendor.capacity && <Badge>{t('vendor.capacity', { count: vendor.capacity })}</Badge>}
          </div>

          <p style={{ marginTop: 'var(--space-lg)', lineHeight: 1.7 }}>{vendor.description}</p>

          {vendor.images?.length > 1 && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-neutral-500)' }}>
                {t('vendor.galleryHeading')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-sm)' }}>
                {vendor.images.slice(1).map((image, index) => (
                  <div
                    key={image}
                    style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
                  >
                    <Image
                      src={apiClient.assetUrl(image)}
                      alt={`${vendor.businessName} ${index + 2}`}
                      fill
                      sizes="120px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
            <WhatsAppButton whatsapp={vendor.whatsapp} />
            <FavoriteButton vendorId={vendor._id} />
          </div>

          {vendor.amenities?.length > 0 && (
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{t('vendor.amenitiesHeading')}</h2>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
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
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{t('vendor.locationHeading')}</h2>
              <VendorMap lat={lat} lng={lng} name={vendor.businessName} />
            </div>
          )}

          <div style={{ marginTop: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{t('vendor.reviewsHeading')}</h2>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-neutral-500)' }}>{t('vendor.noReviews')}</p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <strong>{review.userId?.name ?? '—'}</strong>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
                      <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                      {review.rating}
                    </span>
                    <p style={{ margin: '4px 0 0' }}>{review.comment}</p>
                  </Card>
                ))}
              </div>
            )}
            <ReviewForm vendorId={vendor._id} />
          </div>
        </div>

        <aside className="vendor-detail-aside">
          <Card>
            <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-lg)' }}>{t('vendor.getQuote')}</h2>
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
