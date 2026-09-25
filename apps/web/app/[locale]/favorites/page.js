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
    <main className="container page-main">
      <h1 className="page-header__title" style={{ marginBottom: 'var(--space-lg)' }}>{t('heading')}</h1>
      {loading && <p>{t('loading')}</p>}
      {error && (
        <p className="empty-state" role="status">
          {error}
          <Link href="/login" className="ui-button ui-button--primary">{t('loginLink')}</Link>
        </p>
      )}
      {!loading && !error && items.length === 0 && <p className="empty-state">{t('empty')}</p>}
      <div className="vendor-grid" style={{ marginTop: 'var(--space-lg)' }}>
        {items.map((vendor) => (
          <VendorCard
            key={vendor._id}
            vendor={{ ...vendor, images: (vendor.images ?? []).map(apiClient.assetUrl) }}
            categoryLabel={tCategories(vendor.category)}
            verifiedLabel={tVendor('verified')}
            highlyRatedLabel={tVendor('highlyRated')}
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
