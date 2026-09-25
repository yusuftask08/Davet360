import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { VendorCard, Search } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { CardFavoriteButton } from '../components/CardFavoriteButton.jsx';
import { HomeSearchBar } from '../components/HomeSearchBar.jsx';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

// Sonuç sayfası sorguya göre değişir, kalıcı bir SEO landing page değil — indexlenmez.
export const metadata = { robots: { index: false, follow: true } };

export default async function SearchPage({ params: { locale }, searchParams }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const query = searchParams?.q?.trim() ?? '';
  // Anasayfadaki şehir satırlarının "Tümünü gör" linki buraya düşer — o satırlar sadece
  // ilk 10 kartı gösteriyor, devamını görecek bir yer gerekiyordu.
  const citySlug = searchParams?.city?.trim() ?? '';

  let data = { items: [] };
  if (query) {
    data = await apiClient
      .get(`${ENDPOINTS.vendors}?search=${encodeURIComponent(query)}&limit=48`)
      .catch(() => ({ items: [] }));
  } else if (citySlug) {
    data = await apiClient
      .get(`${ENDPOINTS.vendors}?citySlug=${encodeURIComponent(citySlug)}&limit=48`)
      .catch(() => ({ items: [] }));
  }

  // Şehrin görünen adı (İstanbul) slug'dan (istanbul) türetilemez — sonuçtaki vendor'dan alınır.
  const cityName = data.items[0]?.city ?? citySlug;

  return (
    <main className="container page-main">
      {/* Mobil header'daki arama ikonu buraya düşer — sorgu yoksa boş bir mesaj yerine hem
          serbest metin araması hem kategori+şehir araması gösterilir. */}
      <form method="get" className="search-page__form" role="search">
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
        />
        <button type="submit" className="ui-button ui-button--primary">{t('home.searchSubmit')}</button>
      </form>
      {!query && !citySlug ? (
        <div className="search-page__browse">
          <p className="search-page__or">{t('search.orBrowse')}</p>
          <HomeSearchBar variant="hero" />
        </div>
      ) : (
        <>
          <header className="page-header">
            <h1 className="page-header__title">
              {query ? t('search.heading', { query }) : t('search.cityHeading', { city: cityName })}
            </h1>
            <p className="page-header__meta">
              {t('search.resultsCount', { count: data.total ?? data.items.length })}
            </p>
          </header>

          {data.items.length === 0 ? (
            <p style={{ color: 'var(--color-neutral-500)' }}>
              {query ? t('search.empty') : t('search.cityEmpty')}
            </p>
          ) : (
            <div className="vendor-grid">
              {data.items.map((vendor) => (
                <VendorCard
                  key={vendor._id}
                  vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
                  categoryLabel={t(`categories.${vendor.category}`)}
                  verifiedLabel={t('vendor.verified')}
                  highlyRatedLabel={t('vendor.highlyRated')}
                  as={Link}
                  href={`/${vendor.category}/${vendor.citySlug}/${vendor.slug}`}
                  favorite={<CardFavoriteButton vendorId={vendor._id} />}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
