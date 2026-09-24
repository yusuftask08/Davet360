'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Input, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';
import { AdminNav } from '../../components/AdminNav.jsx';

const STATUS_TABS = [
  { value: '', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'approved', label: 'Onaylı' },
  { value: 'suspended', label: 'Askıda' },
  { value: 'rejected', label: 'Reddedilen' },
];

const STATUS_BADGE_VARIANT = {
  pending: 'default',
  approved: 'success',
  suspended: 'error',
  rejected: 'error',
};

// useSearchParams() Next.js'te Suspense sınırı ister (aksi halde static export hata verir) —
// bu yüzden asıl içerik ayrı bir bileşene taşınıp Suspense ile sarmalandı.
export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <AdminVendorsContent />
    </Suspense>
  );
}

function AdminVendorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (search) query.set('search', search);
    apiClient
      .get(`${ENDPOINTS.adminVendors}?${query.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [status, search]);

  useEffect(load, [load]);

  function setStatus(value) {
    const query = new URLSearchParams(searchParams.toString());
    if (value) query.set('status', value);
    else query.delete('status');
    router.push(`/vendors?${query.toString()}`);
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)' }}>
      <AdminHeader title="İşletme Yönetimi" />
      <AdminNav />

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
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

      <div style={{ maxWidth: 320, marginBottom: 'var(--space-lg)' }}>
        <Input placeholder="İşletme adına göre ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="ui-error-text" role="alert">{error}</p>}

      {!data && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>{data?.total ?? 0} sonuç</p>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {(data?.items ?? []).map((vendor) => (
              <Link key={vendor._id} href={`/vendors/${vendor._id}`} style={{ textDecoration: 'none' }}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{vendor.businessName}</strong>
                      <p style={{ margin: '4px 0 0', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                        {vendor.category} · {vendor.city}
                      </p>
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[vendor.status]}>{vendor.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
            {data?.items.length === 0 && !error && <p>Sonuç bulunamadı.</p>}
          </div>
        </>
      )}
    </main>
  );
}
