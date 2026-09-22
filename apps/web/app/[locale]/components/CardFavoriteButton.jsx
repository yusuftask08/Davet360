'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { Heart } from '@repo/ui';
import { useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { getFavoriteIds, updateFavoriteCache } from '../lib/favoritesCache.js';

// VendorCard'ın sağ üst köşesine gömülü kalp — Airbnb'deki gibi. Kart bir <a> ile
// sarmalandığı için tıklamanın kartın linkine gitmesini engellemek (preventDefault +
// stopPropagation) şart, aksi halde kalbe basan kullanıcı yanlışlıkla ilan sayfasına gider.
export function CardFavoriteButton({ vendorId, onToggle }) {
  const t = useTranslations('vendor');
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedIn = Boolean(localStorage.getItem('user'));
    setIsLoggedIn(loggedIn);
    if (!loggedIn) return;

    // Aynı sayfadaki tüm kartlar bu tek paylaşılan fetch'i bekler — her kart kendi başına
    // istek atmaz (bkz. favoritesCache.js).
    getFavoriteIds().then((ids) => setIsFavorite(ids.has(vendorId)));
  }, [vendorId]);

  async function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await apiClient.del(ENDPOINTS.favoriteToggle(vendorId));
      } else {
        await apiClient.post(ENDPOINTS.favoriteToggle(vendorId));
      }
      setIsFavorite((prev) => !prev);
      updateFavoriteCache(vendorId, !isFavorite);
      onToggle?.(vendorId, !isFavorite);
    } catch {
      // Sessizce yoksay — kart listesinde hata mesajı göstermek için yer yok.
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ui-vendor-card__favorite-btn"
      aria-label={isFavorite ? t('removeFavorite') : t('addFavorite')}
      aria-pressed={isFavorite}
    >
      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
