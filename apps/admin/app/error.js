'use client';

import { useEffect } from 'react';
import { Button } from '@repo/ui';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container" style={{ paddingTop: 'var(--space-3xl)', textAlign: 'center' }}>
      <h1>Bir şeyler ters gitti</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>
        Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <Button onClick={reset}>Tekrar Dene</Button>
    </main>
  );
}
