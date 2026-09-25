import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCategoryBySlug, AMENITIES } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { VendorCard, Button, CategoryIcon, Checkbox, Radio, ChevronDown, ScrollRow } from '@repo/ui';
import { Link } from '../../../../i18n/navigation.js';
import { Breadcrumb } from '../../components/Breadcrumb.jsx';
import { CardFavoriteButton } from '../../components/CardFavoriteButton.jsx';
import { EmptyStateCta } from '../../components/EmptyStateCta.jsx';
import { buildAlternates } from '../../lib/seo.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

// Backend'deki VENDOR_SORTS ile birebir eşleşir (apps/api/src/services/vendorService.js) —
// yeni bir sıralama eklenirse iki tarafta da eklenmesi gerekir.
const SORT_OPTIONS = [
  { value: 'default', labelKey: 'category.sortDefault' },
  { value: 'rating', labelKey: 'category.sortRating' },
  { value: 'budget-asc', labelKey: 'category.sortBudgetAsc' },
  { value: 'budget-desc', labelKey: 'category.sortBudgetDesc' },
];

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
        : `${cityName} bölgesinde onaylı ${label} işletmelerini karşılaştırın, ücretsiz teklif alın.`,
    alternates: buildAlternates(locale, `/${categorySlug}/${citySlug}`),
  };
}

export default async function CategoryCityPage({ params, searchParams }) {
  const { category: categorySlug, city: citySlug, locale } = params;
  setRequestLocale(locale);
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const t = await getTranslations();
  const categoryLabel = t(`categories.${categorySlug}`);
  const { maxBudget, minCapacity, sort } = searchParams ?? {};
  // Checkbox'lardan tek seçilirse string, birden fazla seçilirse dizi gelir (native GET form).
  const selectedAmenities = (() => {
    const raw = searchParams?.amenities;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  })();

  const query = new URLSearchParams({ category: categorySlug, citySlug });
  if (maxBudget) query.set('maxBudget', maxBudget);
  if (minCapacity) query.set('minCapacity', minCapacity);
  if (sort) query.set('sort', sort);
  selectedAmenities.forEach((key) => query.append('amenities', key));

  const activeSortLabel = t(SORT_OPTIONS.find((o) => o.value === (sort ?? 'default')).labelKey);

  const [cityInfo, data, relatedCategories] = await Promise.all([
    fetchCityInfo(categorySlug, citySlug),
    apiClient.get(`${ENDPOINTS.vendors}?${query.toString()}`).catch(() => ({ items: [] })),
    apiClient
      .get(`${ENDPOINTS.vendorCategoriesInCity}?citySlug=${citySlug}&excludeCategory=${categorySlug}`)
      .then((res) => res.items)
      .catch(() => []),
  ]);

  // Not: burada veri yoksa artık notFound() FIRLATILMAZ — kullanıcı arama çubuğundan veya
  // doğrudan URL ile herhangi bir kategori+şehir kombinasyonuna gidebilir; onaylı işletme
  // yoksa aşağıdaki EmptyStateCta benzeri mesaj gösterilir, sert 404 kullanıcı deneyimini bozar.
  const cityName = cityInfo?.city ?? citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="container page-main">
      <Breadcrumb
        locale={locale}
        items={[
          { name: 'Merasim360', href: '' },
          { name: categoryLabel, href: `/${categorySlug}` },
          { name: cityName, href: `/${categorySlug}/${citySlug}` },
        ]}
      />
      <header className="page-header">
        <h1 className="page-header__title">
          {cityName} {categoryLabel}
        </h1>
        <p className="page-header__meta">
          {t('category.vendorCount', { count: data.total ?? data.items.length })}
          {' · '}
          <Link href={`/${categorySlug}`} className="page-header__link">
            {t('category.allCities', { category: categoryLabel })}
          </Link>
        </p>
      </header>

      {/* Tek bir birleşik çubuk — bütçe/kapasite alanları, sıralama ve olanaklar birer
          <details> açılır panel (selectbox gibi kapalı durur, tıklayınca açılır, JS
          gerekmez), hepsi aynı kenarlıklı bar içinde. Eskiden 3 ayrı bloktu, dağınık
          duruyordu. */}
      <form method="get" className="filter-bar">
        <div className="filter-bar__field">
          <label htmlFor="maxBudget">{t('category.maxBudgetLabel')}</label>
          <input
            id="maxBudget"
            name="maxBudget"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={t('category.noLimit')}
            defaultValue={maxBudget ?? ''}
          />
        </div>
        <div className="filter-bar__divider" aria-hidden="true" />
        <div className="filter-bar__field">
          <label htmlFor="minCapacity">{t('category.minCapacityLabel')}</label>
          <input
            id="minCapacity"
            name="minCapacity"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={t('category.noLimit')}
            defaultValue={minCapacity ?? ''}
          />
        </div>
        <div className="filter-bar__divider" aria-hidden="true" />

        <details className="filter-dropdown">
          <summary>
            <span>
              {t('category.sortLabel')}: {activeSortLabel}
            </span>
            <ChevronDown size={16} strokeWidth={2} className="filter-dropdown__chevron" aria-hidden="true" />
          </summary>
          <div className="filter-dropdown__panel">
            {/* Sıralama — tekli seçim, işletme kaydındaki gerçek alanlara (avgRating,
                priceRange) dayanır, uydurma değil. */}
            {SORT_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name="sort"
                value={option.value}
                label={t(option.labelKey)}
                defaultChecked={(sort ?? 'default') === option.value}
              />
            ))}
          </div>
        </details>

        <details className="filter-dropdown">
          <summary>
            <span>
              {t('category.amenitiesLabel')}
              {selectedAmenities.length > 0 ? ` (${selectedAmenities.length})` : ''}
            </span>
            <ChevronDown size={16} strokeWidth={2} className="filter-dropdown__chevron" aria-hidden="true" />
          </summary>
          <div className="filter-dropdown__panel filter-dropdown__panel--wide">
            {/* Olanaklar — vendor kayıt formunda gerçekten işaretlenen alanlardan
                (AMENITIES), uydurma bir liste değil; backend $all ile seçilen olanakların
                hepsine sahip vendor'ları filtreler. */}
            {AMENITIES.map((amenity) => (
              <Checkbox
                key={amenity.key}
                name="amenities"
                value={amenity.key}
                label={amenity.label}
                defaultChecked={selectedAmenities.includes(amenity.key)}
              />
            ))}
          </div>
        </details>

        <Button type="submit" className="filter-bar__submit">
          {t('category.filterButton')}
        </Button>
      </form>

      {data.items.length === 0 ? (
        <EmptyStateCta />
      ) : (
        <div className={`vendor-grid${data.items.length <= 2 ? ' vendor-grid--compact' : ''}`}>
          {data.items.map((vendor) => (
            <VendorCard
              key={vendor._id}
              vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
              categoryLabel={categoryLabel}
              verifiedLabel={t('vendor.verified')}
              highlyRatedLabel={t('vendor.highlyRated')}
              as={Link}
              href={`/${categorySlug}/${citySlug}/${vendor.slug}`}
              favorite={<CardFavoriteButton vendorId={vendor._id} />}
            />
          ))}
        </div>
      )}

      {relatedCategories.length > 0 && (
        <section className="home-section">
          <div className="section-heading section-heading--lg">
            <h2>{t('category.relatedHeading', { city: cityName })}</h2>
          </div>
          <ScrollRow prevLabel={t('common.scrollPrev')} nextLabel={t('common.scrollNext')}>
            {relatedCategories.map((item) => (
              <Link
                key={item.category}
                href={`/${item.category}/${citySlug}`}
                className="hscroll__item category-circle"
              >
                <span className="category-circle__icon">
                  <CategoryIcon slug={item.category} size={28} strokeWidth={1.5} />
                </span>
                <span className="category-circle__label">{t(`categories.${item.category}`)}</span>
              </Link>
            ))}
          </ScrollRow>
        </section>
      )}
    </main>
  );
}
