'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { Button, Heart } from '@repo/ui';
import { useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { getFavoriteIds, updateFavoriteCache } from '../lib/favoritesCache.js';

export function FavoriteButton({ vendorId }) {
  const t = useTranslations('favoriteButton');
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Token artık httpOnly cookie'de — JS'ten okunamaz, isLoggedIn için sadece localStorage'daki
    // (hassas olmayan) kullanıcı bilgisinin varlığına bakılır. Gerçek auth isteği cookie ile gider.
    const loggedIn = Boolean(localStorage.getItem('user'));
    setIsLoggedIn(loggedIn);
    if (!loggedIn) return;

    getFavoriteIds().then((ids) => setIsFavorite(ids.has(vendorId)));
  }, [vendorId]);

  async function toggle() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isFavorite) {
        await apiClient.del(ENDPOINTS.favoriteToggle(vendorId));
      } else {
        await apiClient.post(ENDPOINTS.favoriteToggle(vendorId));
      }
      setIsFavorite((prev) => !prev);
      updateFavoriteCache(vendorId, !isFavorite);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={toggle} disabled={loading}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
          {isFavorite ? t('added') : t('add')}
        </span>
      </Button>
      {error && (
        <p className="ui-error-text" role="alert" style={{ marginTop: 'var(--space-xs)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
