'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Button, Spinner } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get(ENDPOINTS.adminStats)
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="container admin-main">
      <AdminHeader title="Genel Bakış" />

      {error && <p className="ui-error-text" role="alert">{error}</p>}

      {!stats && !error && <Spinner label="Yükleniyor..." />}

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.vendorsByStatus.pending ?? 0}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Onay bekleyen işletme</p>
          </Card>
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.vendorsByStatus.approved ?? 0}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Yayındaki işletme</p>
          </Card>
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.vendorsByStatus.suspended ?? 0}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Askıya alınmış</p>
          </Card>
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.pendingReviews}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Onay bekleyen yorum</p>
          </Card>
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.totalLeads}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Toplam teklif talebi</p>
          </Card>
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.totalUsers}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Toplam kullanıcı</p>
          </Card>
          <Card>
            <strong style={{ fontSize: 'var(--font-size-2xl)' }}>{stats.publishedPosts}</strong>
            <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Yayındaki blog yazısı</p>
          </Card>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <Link href="/vendors?status=pending">
          <Button>Onay Bekleyenleri Gör</Button>
        </Link>
        <Link href="/blog/new">
          <Button variant="secondary">+ Yeni Blog Yazısı</Button>
        </Link>
      </div>
    </main>
  );
}
