'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@repo/ui';

// Panelin gerçek "protected route" katmanı — daha önce sayfalar sadece API'nin 401 dönmesine
// güveniyordu, düzgün bir login yönlendirmesi yoktu. `role` verilirse o role hiç uymayan
// kullanıcı kendi ana sayfasına (admin/vendor) yönlendirilir, hiç giriş yapmamışsa /login'e.
export function RequireAuth({ role, children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    // Token artık httpOnly cookie'de, JS'ten görülemez — burada sadece localStorage'daki
    // (hassas olmayan) kullanıcı bilgisinin varlığına bakılır. Cookie geçersiz/süresi
    // dolmuşsa zaten ilk API isteğinde 401 döner ve sayfa kendi hata durumunu gösterir.
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') ?? 'null');
    } catch {
      user = null;
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === 'admin' ? '/admin' : '/vendor');
      return;
    }
    setStatus('allowed');
  }, [role, router]);

  if (status !== 'allowed') {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <Spinner label="Yükleniyor..." />
      </main>
    );
  }

  return children;
}
