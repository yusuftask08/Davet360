'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@repo/ui';

const PANEL_URL = process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3601';

// Bu app'in TAMAMI admin'e özel — role hep 'admin' aranır. Giriş yapmamışsa /login'e,
// admin olmayan biri (vendor/customer) buraya gelirse kendi paneline (apps/panel) yönlendirilir.
export function RequireAuth({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    // Token httpOnly cookie'de, JS'ten görülemez — burada sadece localStorage'daki (hassas
    // olmayan) kullanıcı bilgisinin varlığına bakılır. Cookie geçersiz/süresi dolmuşsa zaten
    // ilk API isteğinde 401 döner ve sayfa kendi hata durumunu gösterir.
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
    if (user.role !== 'admin') {
      window.location.href = PANEL_URL;
      return;
    }
    setStatus('allowed');
  }, [router]);

  if (status !== 'allowed') {
    return (
      <main className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <Spinner label="Yükleniyor..." />
      </main>
    );
  }

  return children;
}
