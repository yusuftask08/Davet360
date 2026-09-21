import { getTranslations } from 'next-intl/server';
import { Link } from '../../../i18n/navigation.js';
import { AuthNav } from './AuthNav.jsx';
import { LocaleSwitcher } from './LocaleSwitcher.jsx';
import { SearchBox } from './SearchBox.jsx';

// Not: 18 kategori navbar'a tek tek sığmaz/taşar — kategoriler ana sayfadaki grid'de net
// şekilde listeleniyor, navbar'da sadece arama + blog + hesap kalıyor.
export async function Navbar() {
  const t = await getTranslations();

  return (
    <header className="site-navbar">
      <div className="container site-navbar__inner">
        <Link href="/" className="site-navbar__logo">
          Davet<span>360</span>
        </Link>
        <SearchBox />
        <nav className="site-navbar__links">
          <Link href="/blog">{t('nav.blog')}</Link>
          <AuthNav />
        </nav>
        <div className="site-navbar__divider" aria-hidden="true" />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
