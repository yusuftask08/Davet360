'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { User } from '@repo/ui';
import { Link, useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { invalidateFavoritesCache } from '../lib/favoritesCache.js';
import { IconMenu } from './IconMenu.jsx';

// Ayrı bir avatar butonu — hesap menüsü. Hamburger/dil menüsünden (SettingsMenu) kasıtlı
// olarak ayrı: biri "hesabım" biri "ayarlar", tek bir birleşik pilla sıkıştırılmadı.
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

  return (
    <IconMenu icon={<User size={18} strokeWidth={2} aria-hidden="true" />} label={user ? t('account') : t('login')} avatar>
      {({ close }) =>
        user ? (
          <>
            <Link href="/account" role="menuitem" onClick={close}>
              {t('account')}
            </Link>
            <Link href="/favorites" role="menuitem" onClick={close}>
              {t('favorites')}
            </Link>
            <button type="button" role="menuitem" onClick={() => handleLogout(close)}>
              {t('logout')}
            </button>
          </>
        ) : (
          <Link href="/login" role="menuitem" onClick={close}>
            {t('login')}
          </Link>
        )
      }
    </IconMenu>
  );
}
