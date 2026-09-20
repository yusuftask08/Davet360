'use client';

export default function GlobalError({ reset }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '64px 16px' }}>
        <h1>Bir şeyler ters gitti</h1>
        <p style={{ color: '#666' }}>Lütfen sayfayı yenileyin.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: 16, padding: '10px 24px', borderRadius: 999, border: 'none', background: '#B8355F', color: 'white', cursor: 'pointer' }}
        >
          Tekrar Dene
        </button>
      </body>
    </html>
  );
}
