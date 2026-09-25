'use client';

import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';
import { statusLabel } from '../../../lib/labels.js';

export default function AdminLeadsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get(ENDPOINTS.adminLeads).then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <main className="container admin-main">
      <AdminHeader title="Tüm Teklif Talepleri" />

      {error && <p className="ui-error-text" role="alert">{error}</p>}

      {!data && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>{data?.total ?? 0} talep</p>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {(data?.items ?? []).map((lead) => (
              <Card key={lead._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{lead.vendorId?.businessName ?? 'Silinmiş vendor'}</strong>
                  <Badge variant={lead.status === 'new' ? 'accent' : lead.status === 'contacted' ? 'success' : 'default'}>{statusLabel(lead.status)}</Badge>
                </div>
                <p style={{ margin: '4px 0', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                  {lead.customerName} · {lead.customerPhone} ·{' '}
                  {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                </p>
                {lead.message && <p style={{ margin: 0 }}>{lead.message}</p>}
              </Card>
            ))}
            {data?.items.length === 0 && !error && <p>Henüz teklif talebi yok.</p>}
          </div>
        </>
      )}
    </main>
  );
}
