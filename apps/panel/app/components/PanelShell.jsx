'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ENDPOINTS } from '@repo/api-client';
import { ClipboardList, Home, User } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';

const NAV_ITEMS = [
  { href: '/vendor', label: 'Teklifler', Icon: ClipboardList, match: (p) => p === '/vendor' },
  { href: '/vendor/edit', label: 'İlanım', Icon: Home, match: (p) => p.startsWith('/vendor/edit') || p.startsWith('/vendor/new') },
  { href: '/settings', label: 'Hesap', Icon: User, match: (p) => p.startsWith('/settings') },
];

// Panelin tüm giriş yapılmış sayfalarını saran kabuk: üstte tam genişlik sticky bar (logo +
// masaüstünde sekmeler + çıkış), mobilde sekmeler alt gezinme barına iner (web'deki gibi).
// Eskiden her sayfa kendi <main>'i içinde PanelHeader render ediyordu — sayfa maxWidth'i
// daraldıkça header da daralıyordu, linkler varsayılan mavi link stilinde kalıyordu.
export function PanelShell({ children }) {
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
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>
      <header className="panel-bar">
        <div className="panel-bar__inner">
          <Link href="/vendor" className="panel-bar__logo">
            <b>
              Merasim<span>360</span>
            </b>
            <small>İşletme</small>
          </Link>
          <nav className="panel-bar__nav" aria-label="Panel menüsü">
            {NAV_ITEMS.map(({ href, label, match }) => (
              <Link
                key={href}
                href={href}
                className={`panel-bar__link${match(pathname) ? ' is-active' : ''}`}
                aria-current={match(pathname) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button type="button" className="panel-bar__logout" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </header>
      <div id="main-content">{children}</div>
      <nav className="panel-tabs" aria-label="Panel alt menüsü">
        {NAV_ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} className={`panel-tabs__item${active ? ' is-active' : ''}`}>
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
