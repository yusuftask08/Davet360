'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { Button } from '@repo/ui';
import { useRouter } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';

export function FavoriteButton({ vendorId }) {
  const t = useTranslations('favoriteButton');
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
    if (!token) return;

    apiClient
      .get(ENDPOINTS.favorites)
      .then((data) => setIsFavorite(data.items.some((vendor) => vendor._id === vendorId)))
      .catch(() => {
        // Favori durumunu göremesek de sayfa çalışmaya devam eder — sessizce varsayılan kalır.
      });
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={toggle} disabled={loading}>
        {isFavorite ? t('added') : t('add')}
      </Button>
      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
