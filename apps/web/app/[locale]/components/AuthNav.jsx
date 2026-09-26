'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { User } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { invalidateFavoritesCache } from '../lib/favoritesCache.js';
import { IconMenu } from './IconMenu.jsx';

// Header'ın sağındaki hesap hapı (The Knot'taki "Your account" gibi): giriş yapılmamışsa
// doğrudan giriş sayfasına giden bir hap, yapılmışsa baş harfli hap + hesap menüsü.
// Aç/kapa mantığı IconMenu'de yaşıyor, burada tekrarlanmıyor.
export function AuthNav() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') ?? 'null'));
    } catch {
      setUser(null);
    }
  }, []);

  function handleLogout(close) {
    // httpOnly cookie JS'ten silinemez — backend'e /auth/logout isteği atıp clearCookie
    // yaptırmak gerekiyor. localStorage'daki kullanıcı bilgisi de ayrıca temizlenir.
    apiClient.post(ENDPOINTS.logout).catch(() => {});
    localStorage.removeItem('user');
    invalidateFavoritesCache();
    setUser(null);
    close();
    router.push('/');
  }

  if (!user) {
    return (
      <Link href="/login" className="account-pill">
        <span className="account-pill__avatar" aria-hidden="true">
          <User size={14} strokeWidth={2.25} />
        </span>
        {t('login')}
      </Link>
    );
  }

  return (
    <IconMenu
      triggerClassName="account-pill"
      label={t('account')}
      icon={
        <>
          <span className="account-pill__avatar" aria-hidden="true">
            {user.name?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
          {t('accountPill')}
        </>
      }
    >
      {({ close }) => (
        <>
          <Link href="/account" role="menuitem" onClick={close}>
            {t('account')}
          </Link>
          <Link href="/account" role="menuitem" onClick={close}>
            {t('myLeads')}
          </Link>
          <Link href="/favorites" role="menuitem" onClick={close}>
            {t('favorites')}
          </Link>
          <button type="button" role="menuitem" onClick={() => handleLogout(close)}>
            {t('logout')}
          </button>
        </>
      )}
    </IconMenu>
  );
}
