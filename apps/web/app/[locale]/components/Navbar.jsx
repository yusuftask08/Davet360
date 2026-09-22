import { getTranslations } from 'next-intl/server';
import { Link } from '../../../i18n/navigation.js';
import { AuthNav } from './AuthNav.jsx';
import { LocaleSwitcher } from './LocaleSwitcher.jsx';
import { HomeSearchBar } from './HomeSearchBar.jsx';

// Airbnb düzeni: üst satır logo + sağ üst araçlar (blog/hesap/dil), altında ayrı, bol boşluklu
// bir satırda arama çubuğu — tek satıra sıkıştırılmış hâli kalabalık/okunaksız duruyordu.
export async function Navbar() {
  const t = await getTranslations();

  return (
    <header className="site-navbar">
      <div className="container site-navbar__top">
        <Link href="/" className="site-navbar__logo">
          Merasim<span>360</span>
        </Link>
        <div className="site-navbar__right">
          <nav className="site-navbar__links">
            <Link href="/blog">{t('nav.blog')}</Link>
            <AuthNav />
          </nav>
          <div className="site-navbar__divider" aria-hidden="true" />
          <LocaleSwitcher />
        </div>
      </div>
      <div className="container site-navbar__search-row">
        <HomeSearchBar />
      </div>
    </header>
  );
}
