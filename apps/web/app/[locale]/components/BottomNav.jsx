'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Heart, User } from '@repo/ui';
import { Link, usePathname } from '../../../i18n/navigation.js';

// Sadece mobilde görünür (CSS media query, bkz. globals.css) — Airbnb'nin alt sekme barı
// gibi. Masaüstünde navbar zaten bu linkleri (hesap/favoriler) kapsıyor, tekrar göstermeye
// gerek yok; mobilde ekran dar olduğu için ayrı, sabit bir alt bar daha kullanışlı.
export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('user')));
  }, [pathname]);

  const items = [
    { href: '/', label: t('discover'), Icon: Home, match: (p) => p === '/' },
    { href: '/favorites', label: t('favorites'), Icon: Heart, match: (p) => p.startsWith('/favorites') },
    isLoggedIn
      ? { href: '/account', label: t('account'), Icon: User, match: (p) => p.startsWith('/account') }
      : { href: '/login', label: t('login'), Icon: User, match: (p) => p.startsWith('/login') },
  ];

  return (
    <nav className="bottom-nav" aria-label={t('mobileNavLabel')}>
      {items.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
