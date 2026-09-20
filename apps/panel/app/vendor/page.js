'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Button, Spinner } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { PanelHeader } from '../components/PanelHeader.jsx';

export default function VendorDashboard() {
  const [leads, setLeads] = useState(null);
  const [hasVendor, setHasVendor] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (!user?.vendorId) {
      setHasVendor(false);
      return;
    }
    apiClient
      .get(ENDPOINTS.vendorLeads(user.vendorId))
      .then((data) => setLeads(data.items))
      .catch((err) => setError(err.message));
  }, []);

  if (!hasVendor) {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-md)' }}>
        <PanelHeader title="Vendor Paneli" />
        <Card>
          <h1 style={{ marginTop: 0 }}>Henüz bir ilanınız yok</h1>
          <p style={{ color: 'var(--color-neutral-500)' }}>
            Teklif talebi alabilmek için önce işletme bilgilerinizi girmeniz gerekiyor.
          </p>
          <Link href="/vendor/new">
            <Button>İlan Oluştur</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)' }}>
      <PanelHeader title="Vendor Paneli" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <Link href="/vendor/edit">
          <Button variant="secondary">İlanımı Düzenle</Button>
        </Link>
      </div>
      <h1>Gelen Teklif Talepleri</h1>
      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
      {!leads && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          {(leads ?? []).map((lead) => (
            <Card key={lead._id}>
              <strong>{lead.customerName}</strong> — {lead.customerPhone} <Badge>{lead.status}</Badge>
              {lead.message && <p>{lead.message}</p>}
            </Card>
          ))}
          {leads?.length === 0 && !error && <p>Henüz teklif talebi yok.</p>}
        </div>
      )}
    </main>
  );
}
