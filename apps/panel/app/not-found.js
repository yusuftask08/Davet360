import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: 'var(--space-3xl)', textAlign: 'center' }}>
      <h1>Sayfa bulunamadı</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
      <Link href="/login" className="ui-button ui-button--primary">
        Giriş sayfasına dön
      </Link>
    </main>
  );
}
