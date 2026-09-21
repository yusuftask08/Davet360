'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getCategoryBySlug } from '@repo/constants';
import { ENDPOINTS } from '@repo/api-client';
import { VendorCard } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { apiClient } from '../../../lib/apiClient.js';
import { CardFavoriteButton } from '../components/CardFavoriteButton.jsx';

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const tCategories = useTranslations('categories');
  const tVendor = useTranslations('vendor');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      setError(t('loginRequired'));
      setLoading(false);
      return;
    }
    apiClient
      .get(ENDPOINTS.favorites)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <h1 style={{ fontSize: 'var(--font-size-xl)' }}>{t('heading')}</h1>
      {loading && <p>{t('loading')}</p>}
      {error && (
        <p style={{ color: 'var(--color-error)' }}>
          {error} <Link href="/login" className="link-inline">{t('loginLink')}</Link>
        </p>
      )}
      {!loading && !error && items.length === 0 && <p>{t('empty')}</p>}
      <div className="vendor-grid" style={{ marginTop: 'var(--space-lg)' }}>
        {items.map((vendor) => (
          <VendorCard
            key={vendor._id}
            vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
            categoryLabel={tCategories(vendor.category)}
            verifiedLabel={tVendor('verified')}
            as={Link}
            href={`/${vendor.category}/${vendor.citySlug}/${vendor.slug}`}
            favorite={
              <CardFavoriteButton
                vendorId={vendor._id}
                onToggle={(id, isFavorite) => {
                  if (!isFavorite) setItems((prev) => prev.filter((item) => item._id !== id));
                }}
              />
            }
          />
        ))}
      </div>
    </main>
  );
}
