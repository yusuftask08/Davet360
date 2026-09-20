'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui';

// Bu segment altında (sayfa render/data fetch) beklenmedik bir hata olursa Next.js default
// çökme ekranı yerine bu gösterilir — kullanıcı asla ham stack trace görmez.
export default function ErrorBoundary({ error, reset }) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)', textAlign: 'center' }}>
      <h1>{t('pageTitle')}</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>{t('pageDescription')}</p>
      <Button onClick={reset}>{t('retry')}</Button>
    </main>
  );
}
