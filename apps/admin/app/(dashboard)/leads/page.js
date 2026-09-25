'use client';

import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';
import Link from 'next/link';
import { statusLabel, leadStatusVariant } from '../../../lib/labels.js';

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
              <Link key={lead._id} href={`/leads/${lead._id}`} className="admin-card-anchor">
              <Card className="admin-card-link">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{lead.vendorId?.businessName ?? 'Silinmiş vendor'}</strong>
                  <Badge variant={leadStatusVariant(lead.status)}>{statusLabel(lead.status)}</Badge>
                </div>
                <p style={{ margin: '4px 0', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                  {lead.customerName} · {lead.customerPhone} ·{' '}
                  {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                </p>
                {(lead.lastMessagePreview ?? lead.message) && <p style={{ margin: 0 }}>{lead.lastMessagePreview ?? lead.message}</p>}
              </Card>
              </Link>
            ))}
            {data?.items.length === 0 && !error && <p>Henüz teklif talebi yok.</p>}
          </div>
        </>
      )}
    </main>
  );
}
