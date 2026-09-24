'use client';

import { useCallback, useEffect, useState } from 'react';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Button, Input, Spinner } from '@repo/ui';
import { apiClient } from '../../../lib/apiClient.js';
import { AdminHeader } from '../../components/AdminHeader.jsx';
import { AdminNav } from '../../components/AdminNav.jsx';

const ROLES = ['customer', 'vendor', 'admin'];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    setCurrentUserId(user?.id);
  }, []);

  const load = useCallback(() => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    apiClient
      .get(`${ENDPOINTS.adminUsers}?${query.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [search]);

  useEffect(load, [load]);

  async function toggleActive(user) {
    setActionError(null);
    try {
      await apiClient.patch(ENDPOINTS.adminUserUpdate(user._id), { isActive: !user.isActive });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function changeRole(user, role) {
    setActionError(null);
    try {
      await apiClient.patch(ENDPOINTS.adminUserUpdate(user._id), { role });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-2xl)' }}>
      <AdminHeader title="Kullanıcı Yönetimi" />
      <AdminNav />

      <div style={{ maxWidth: 320, marginBottom: 'var(--space-lg)' }}>
        <Input placeholder="İsim veya email ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="ui-error-text" role="alert">{error}</p>}
      {actionError && <p className="ui-error-text" role="alert">{actionError}</p>}

      {!data && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {(data?.items ?? []).map((user) => (
            <Card key={user._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <div>
                  <strong>{user.name}</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                    {user.email}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                  <Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Aktif' : 'Devre Dışı'}</Badge>
                  <select
                    className="ui-input"
                    style={{ width: 'auto' }}
                    value={user.role}
                    disabled={user._id === currentUserId}
                    onChange={(e) => changeRole(user, e.target.value)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <Button variant="ghost" onClick={() => toggleActive(user)} disabled={user._id === currentUserId}>
                    {user.isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {data?.items.length === 0 && !error && <p>Sonuç bulunamadı.</p>}
        </div>
      )}
    </main>
  );
}
