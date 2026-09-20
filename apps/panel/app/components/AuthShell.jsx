import Link from 'next/link';

// Login/register/şifre sıfırlama sayfaları için markalı, web ile aynı gradyanı kullanan sarmalayıcı —
// önceden panel'in bu sayfaları çıplak beyaz arka planlı bir Card'dan ibaretti.
export function AuthShell({ children }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-lg)',
        background: 'var(--gradient-hero)',
      }}
    >
      <Link
        href="/login"
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 800,
          color: 'white',
          textDecoration: 'none',
          marginBottom: 'var(--space-lg)',
        }}
      >
        Davet<span style={{ color: 'var(--color-accent)' }}>360</span>
      </Link>
      <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
    </main>
  );
}
