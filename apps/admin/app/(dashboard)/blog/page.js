'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Button, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';
import { AdminNav } from '../../components/AdminNav.jsx';

export default function AdminBlogListPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get(ENDPOINTS.adminBlogList)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)' }}>
      <AdminHeader title="Blog Yönetimi" />
      <AdminNav />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <Link href="/blog/new">
          <Button>+ Yeni Yazı</Button>
        </Link>
      </div>

      {error && <p className="ui-error-text" role="alert">{error}</p>}

      {!items && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {(items ?? []).map((post) => (
            <Link key={post._id} href={`/blog/${post._id}/edit`} style={{ textDecoration: 'none' }}>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{post.title}</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                      {post.authorId?.name}
                    </p>
                  </div>
                  <Badge variant={post.publishedAt ? 'success' : 'default'}>
                    {post.publishedAt ? 'Yayında' : 'Taslak'}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
          {items?.length === 0 && !error && <p>Henüz yazı yok.</p>}
        </div>
      )}
    </main>
  );
}
