'use client';

import { useCallback, useEffect, useState } from 'react';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Button, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { PanelHeader } from '../../components/PanelHeader.jsx';
import { AdminNav } from '../components/AdminNav.jsx';

const STATUS_TABS = [
  { value: '', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'approved', label: 'Onaylı' },
  { value: 'rejected', label: 'Reddedilen/Kaldırılan' },
];

export default function AdminReviewsPage() {
  const [status, setStatus] = useState('pending');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(() => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    apiClient
      .get(`${ENDPOINTS.adminReviews}?${query.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [status]);

  useEffect(load, [load]);

  async function runAction(action) {
    setActionError(null);
    try {
      await action();
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)' }}>
      <PanelHeader title="Yorum Yönetimi" />
      <AdminNav />

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`ui-button ${status === tab.value ? 'ui-button--primary' : 'ui-button--ghost'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
      {actionError && <p style={{ color: 'var(--color-error)' }}>{actionError}</p>}

      {!data && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {(data?.items ?? []).map((review) => (
            <Card key={review._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{review.vendorId?.businessName}</strong>
                <Badge>{review.status}</Badge>
              </div>
              <p style={{ margin: '4px 0', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                {review.userId?.name} ({review.userId?.email}) · {review.rating} ★
              </p>
              <p style={{ margin: '0 0 var(--space-sm)' }}>{review.comment}</p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {review.status !== 'approved' && (
                  <Button onClick={() => runAction(() => apiClient.post(ENDPOINTS.adminReviewApprove(review._id)))}>
                    Onayla
                  </Button>
                )}
                {review.status === 'pending' && (
                  <Button variant="ghost" onClick={() => runAction(() => apiClient.post(ENDPOINTS.adminReviewReject(review._id)))}>
                    Reddet
                  </Button>
                )}
                {review.status === 'approved' && (
                  <Button variant="ghost" onClick={() => runAction(() => apiClient.post(ENDPOINTS.adminReviewUnpublish(review._id)))}>
                    Yayından Kaldır
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {data?.items.length === 0 && !error && <p>Sonuç bulunamadı.</p>}
        </div>
      )}
    </main>
  );
}
