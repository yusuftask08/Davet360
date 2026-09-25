'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ENDPOINTS } from '@repo/api-client';
import { apiClient } from '../../lib/apiClient.js';

const LINKS = [
  { href: '/', label: 'Genel Bakış' },
  { href: '/vendors', label: 'İşletmeler' },
  { href: '/leads', label: 'Teklif Talepleri' },
  { href: '/reviews', label: 'Yorumlar' },
  { href: '/users', label: 'Kullanıcılar' },
  { href: '/blog', label: 'Blog' },
  { href: '/audit-log', label: 'İşlem Geçmişi' },
];

// Admin sayfalarının ortak kabuğu: tam genişlik sticky üst bar (logo + hesap + çıkış) ve
// altında yatay kaydırılabilen sekme satırı. Eskiden her sayfa AdminHeader + AdminNav'ı kendi
// <main>'i içinde render ediyordu; başlık logoya yapışık, linkler varsayılan mavi stildeydi.
export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    // httpOnly cookie JS'ten silinemez — backend'e /auth/logout isteği atıp clearCookie
    // yaptırmak gerekiyor.
    apiClient.post(ENDPOINTS.logout).catch(() => {});
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <>
      {/* Admin navigasyonu 7 link içeriyor — klavye kullanıcısı her sayfada bunların hepsini
          tab'lamak zorunda kalmasın. */}
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>
      <header className="admin-bar">
        <div className="admin-bar__top">
          <Link href="/" className="admin-bar__logo">
            <b>
              Merasim<span>360</span>
            </b>
            <small>Admin</small>
          </Link>
          <div className="admin-bar__actions">
            <Link
              href="/settings"
              className={`admin-bar__action${pathname.startsWith('/settings') ? ' is-active' : ''}`}
            >
              Hesap
            </Link>
            <button type="button" className="admin-bar__action" onClick={handleLogout}>
              Çıkış
            </button>
          </div>
        </div>
        <nav className="admin-bar__nav" aria-label="Admin menüsü">
          {LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-bar__link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div id="main-content">{children}</div>
    </>
  );
}
