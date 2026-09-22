'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ENDPOINTS } from '@repo/api-client';
import { Button } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';

export function PanelHeader({ title }) {
  const router = useRouter();

  function handleLogout() {
    // httpOnly cookie JS'ten silinemez — backend'e /auth/logout isteği atıp clearCookie
    // yaptırmak gerekiyor.
    apiClient.post(ENDPOINTS.logout).catch(() => {});
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <div className="panel-header">
      <div className="panel-header__logo">
        Merasim<span>360</span> {title && `· ${title}`}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <Link href="/settings" style={{ fontSize: 'var(--font-size-sm)' }}>
          Hesap Ayarları
        </Link>
        <Button variant="ghost" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
