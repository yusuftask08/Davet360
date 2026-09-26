import { getTranslations } from 'next-intl/server';
import { getCategoryBySlug, CATEGORIES } from '@repo/constants';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { slugify } from '@repo/utils';
import { ArrowRight, Heart } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { LocaleSwitcher } from './LocaleSwitcher.jsx';

// Footer'daki kısa kategori listesi — en çok aranan düğün kategorileri + özel günlerden birkaçı.
const FOOTER_CATEGORIES = [
  'dugun-mekani',
  'dugun-organizasyonu',
  'nisan-organizasyonu',
  'fotograf-video',
  'gelinlik-damatlik',
  'sunnet-organizasyonu',
];

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

// Anasayfadan kaldırılan "Popüler Aramalar" fikri buraya, footer'a taşındı — Airbnb'nin
// "Gelecek kaçamaklarınız için fikirler" bloğu gibi. Gerçek onaylı vendor verisi varsa o
// kategori+şehir kombinasyonu kullanılır, yoksa Türkiye geneline yayılmış varsayılan bir
// şehir (uydurma işletme DEĞİL, sadece link — hedef sayfa "ilk işletme siz olun" ile karşılar).
const DEFAULT_COMBO_CITY = {
  'dugun-mekani': 'İstanbul',
  'dugun-organizasyonu': 'Ankara',
  'nisan-organizasyonu': 'İzmir',
  'kina-gecesi': 'Bursa',
  'sunnet-organizasyonu': 'Antalya',
  'dogum-gunu-organizasyonu': 'Adana',
  'baby-shower': 'Konya',
  'mezuniyet-organizasyonu': 'Gaziantep',
  'kurumsal-etkinlik': 'Kayseri',
  'orkestra-muzik': 'Mersin',
  'fotograf-video': 'Eskişehir',
  'catering-ikram': 'Samsun',
  'pasta-tatli': 'Kocaeli',
  'dekorasyon-balon': 'Denizli',
  davetiye: 'Trabzon',
  'gelinlik-damatlik': 'Şanlıurfa',
  'kuafor-makyaj': 'Diyarbakır',
  'animasyon-cocuk': 'Malatya',
};

export async function Footer() {
  const t = await getTranslations();
  const panelUrl = process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3001';

  const realCombos = await apiClient.get(`${ENDPOINTS.vendorPopularCombos}?limit=18`).catch(() => ({ items: [] }));
  const realComboByCategory = new Map(realCombos.items.map((combo) => [combo.category, combo]));
  const browseLinks = CATEGORIES.map((category) => {
    const real = realComboByCategory.get(category.slug);
    if (real) return real;
    const city = DEFAULT_COMBO_CITY[category.slug];
    return { category: category.slug, city, citySlug: slugify(city) };
  });

  return (
    <footer className="site-footer">
      <div className="container">
        <h2 className="site-footer__browse-heading">{t('footer.browseHeading')}</h2>
        <div className="site-footer__browse-grid">
          {browseLinks.map((combo) => {
            const category = getCategoryBySlug(combo.category);
            if (!category) return null;
            return (
              <Link key={`${combo.category}-${combo.citySlug}`} href={`/${combo.category}/${combo.citySlug}`}>
                {combo.city} <span className="site-footer__browse-meta">{t(`categories.${combo.category}`)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="container site-footer__main">
        <div className="site-footer__brand">
          <div className="site-navbar__logo">
            Merasim<span>360</span>
          </div>
          <p className="site-footer__made">
            {t('footer.madeWith')} <Heart size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          </p>
          <p className="site-footer__muted">{t('footer.tagline')}</p>
        </div>

        <div>
          <h3 className="site-footer__heading">{t('footer.planningHeading')}</h3>
          <ul className="site-footer__list">
            <li><Link href="/blog">{t('nav.guide')}</Link></li>
            <li><Link href="/faq">{t('pages.faq.title')}</Link></li>
            <li><Link href="/favorites">{t('nav.favorites')}</Link></li>
            <li><Link href="/account">{t('nav.myLeads')}</Link></li>
            <li><Link href="/search">{t('nav.search')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer__heading">{t('footer.categoriesHeading')}</h3>
          <ul className="site-footer__list">
            {FOOTER_CATEGORIES.map((slug) => (
              <li key={slug}>
                <Link href={`/${slug}`}>{t(`categories.${slug}`)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="site-footer__heading">{t('footer.companyHeading')}</h3>
          <ul className="site-footer__list">
            <li><Link href="/about">{t('footer.about')}</Link></li>
            <li><Link href="/contact">{t('footer.contact')}</Link></li>
            <li><Link href="/privacy">{t('footer.privacy')}</Link></li>
            <li><Link href="/terms">{t('footer.terms')}</Link></li>
          </ul>
        </div>

        <div className="site-footer__vendor">
          <h3 className="site-footer__vendor-title">{t('footer.vendorTitle')}</h3>
          <p className="site-footer__muted">{t('footer.vendorText')}</p>
          <a href={`${panelUrl}/register`} className="site-footer__vendor-link">
            {t('footer.vendorCta')}
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Merasim360 — {t('footer.rights')}</span>
        <LocaleSwitcher />
      </div>
    </footer>
  );
}
