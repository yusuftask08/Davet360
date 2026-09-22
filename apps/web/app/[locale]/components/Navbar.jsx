import { getTranslations } from 'next-intl/server';
import { CATEGORIES } from '@repo/constants';
import { CategoryIcon } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { AuthNav } from './AuthNav.jsx';
import { SettingsMenu } from './SettingsMenu.jsx';
import { HomeSearchBar } from './HomeSearchBar.jsx';

// Airbnb düzeni: tek satırda logo + arama çubuğu + sağ üst iki ayrı ikon butonu, altında
// ince bir kategori ikon şeridi — ikisi de sticky header içinde, kaydırınca kaybolmuyor.
// Hamburger (SettingsMenu — dil/ayarlar) ve avatar (AuthNav — hesap) kasıtlı olarak ayrı
// iki buton, tek bir birleşik pilla sıkıştırılmadı.
export async function Navbar() {
  const t = await getTranslations();

  return (
    <header className="site-navbar">
      <div className="container site-navbar__top">
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
