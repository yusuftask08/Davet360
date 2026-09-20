import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CATEGORIES } from '@repo/constants';
import { Card } from '@repo/ui';
import { Link } from '../../i18n/navigation.js';

const CATEGORY_ICONS = {
  'dugun-mekani': '🏛️',
  'dugun-organizasyonu': '💐',
  'nisan-organizasyonu': '💍',
  'kina-gecesi': '🕯️',
  'sunnet-organizasyonu': '🎊',
  'dogum-gunu-organizasyonu': '🎂',
  'baby-shower': '🍼',
  'mezuniyet-organizasyonu': '🎓',
  'kurumsal-etkinlik': '🏢',
  'orkestra-muzik': '🎻',
  'fotograf-video': '📷',
  'catering-ikram': '🍽️',
  'pasta-tatli': '🧁',
  'dekorasyon-balon': '🎈',
  'davetiye': '✉️',
  'gelinlik-damatlik': '👗',
  'kuafor-makyaj': '💄',
  'animasyon-cocuk': '🎭',
};

export default async function HomePage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <section className="hero">
        <div className="hero__content">
          <h1>{t('home.title')}</h1>
          <p>{t('home.description')}</p>
          <Link
            href="#kategoriler"
            className="ui-button ui-button--primary"
            style={{ background: 'white', color: 'var(--color-primary-dark)' }}
          >
            {t('home.browseCategories')}
          </Link>
        </div>
      </section>

      <div className="trust-strip">
        <span>✓ {t('home.trustApproved')}</span>
        <span>✓ {t('home.trustFreeQuote')}</span>
        <span>✓ {t('home.trustWhatsapp')}</span>
      </div>

      <section id="kategoriler" style={{ marginTop: 'var(--space-3xl)' }}>
        <div className="section-heading">
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>{t('home.categoriesHeading')}</h2>
          <span className="section-heading__meta">{t('home.categoriesSubheading')}</span>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/${category.slug}`} style={{ textDecoration: 'none' }}>
              <Card>
                <div className="category-icon">{CATEGORY_ICONS[category.slug] ?? '✦'}</div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', margin: '0 0 4px' }}>
                  {t(`categories.${category.slug}`)}
                </h3>
                <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  {t('home.browseVendors')}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
