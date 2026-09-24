'use client';

import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';
import { AdminNav } from '../../components/AdminNav.jsx';

export default function AdminAuditLogPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get(ENDPOINTS.adminAuditLog).then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)' }}>
      <AdminHeader title="İşlem Geçmişi" />
      <AdminNav />

      {error && <p className="ui-error-text" role="alert">{error}</p>}

      {!data && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>{data?.total ?? 0} kayıt</p>
          <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
            {(data?.items ?? []).map((entry) => (
              <Card key={entry._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Badge variant="accent">{entry.action}</Badge>{' '}
                    <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                      {entry.targetType}
                    </span>
                  </div>
                  <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                    {entry.adminId?.name} · {new Date(entry.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              </Card>
            ))}
            {data?.items.length === 0 && !error && <p>Henüz kayıt yok.</p>}
          </div>
        </>
      )}
    </main>
  );
}
