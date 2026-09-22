import { getTranslations } from 'next-intl/server';
import { Link } from '../../../i18n/navigation.js';
import { AuthNav } from './AuthNav.jsx';
import { LocaleSwitcher } from './LocaleSwitcher.jsx';
import { HomeSearchBar } from './HomeSearchBar.jsx';

// Tek arama alanı: Kategori+Şehir bar'ı artık navbar'ın kendisinde, her sayfada görünür —
// önceden anasayfaya özel ayrı bir bileşendi, navbar'da da küçük bir metin arama kutusu vardı,
// ikisi birden kafa karıştırıyordu. Şimdi tek, site genelinde sabit bir arama var.
export async function Navbar() {
  const t = await getTranslations();

  return (
    <header className="site-navbar">
      <div className="container site-navbar__inner">
        <Link href="/" className="site-navbar__logo">
          Merasim<span>360</span>
        </Link>
        <div className="site-navbar__search-slot">
          <HomeSearchBar />
        </div>
        <div className="site-navbar__right">
          <nav className="site-navbar__links">
            <Link href="/blog">{t('nav.blog')}</Link>
            <AuthNav />
          </nav>
          <div className="site-navbar__divider" aria-hidden="true" />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
