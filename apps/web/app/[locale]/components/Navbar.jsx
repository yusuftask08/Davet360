import { getTranslations } from 'next-intl/server';
import { CATEGORIES } from '@repo/constants';
import { CategoryIcon, Search } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { AuthNav } from './AuthNav.jsx';
import { SettingsMenu } from './SettingsMenu.jsx';
import { HomeSearchBar } from './HomeSearchBar.jsx';
import { MobileMenu } from './MobileMenu.jsx';

// Airbnb düzeni: tek satırda logo + arama çubuğu + sağ üst iki ayrı ikon butonu, altında
// ince bir kategori ikon şeridi — ikisi de sticky header içinde, kaydırınca kaybolmuyor.
// Hamburger (SettingsMenu — dil/ayarlar) ve avatar (AuthNav — hesap) kasıtlı olarak ayrı
// iki buton, tek bir birleşik pilla sıkıştırılmadı.
// Mobilde düzen değişir: solda hamburger çekmecesi (MobileMenu), ortada logo, sağda arama
// ikonu — arama çubuğu ve kategori şeridi header'dan kalkar (anasayfada hero'daki arama,
// diğer sayfalarda /search sayfası kullanılır). Hesap linki zaten alt gezinme barında.
export async function Navbar() {
  const t = await getTranslations();
  const panelUrl = process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3001';

  return (
    <header className="site-navbar">
      <div className="container site-navbar__top">
        <div className="site-navbar__mobile-only">
          <MobileMenu panelUrl={panelUrl} />
        </div>
        <Link href="/" className="site-navbar__logo">
          Merasim<span>360</span>
        </Link>
        <div className="site-navbar__search-row">
          <HomeSearchBar />
        </div>
        <div className="site-navbar__right">
          {/* Dil değiştirme SettingsMenu'nün içinde — mobilde de erişilebilir olmalı,
              bu yüzden mobilde gizlenen auth-desktop sarmalayıcısının DIŞINDA duruyor. */}
          <SettingsMenu />
          {/* Mobilde alt gezinme barı zaten hesap/giriş linkini içeriyor, burada tekrar
              göstermek gereksiz yer kaplar — bu yüzden sadece masaüstünde görünür. */}
          <span className="site-navbar__auth-desktop">
            <AuthNav />
          </span>
        </div>
        <Link href="/search" className="site-navbar__mobile-only site-navbar__search-icon" aria-label={t('home.searchSubmit')}>
          <Search size={22} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
      <nav className="container category-strip" aria-label={t('home.categoriesHeading')}>
        {CATEGORIES.map((category) => (
          <Link key={category.slug} href={`/${category.slug}`} className="category-strip__item">
            <CategoryIcon slug={category.slug} size={18} strokeWidth={1.5} />
            <span>{t(`categories.${category.slug}`)}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
