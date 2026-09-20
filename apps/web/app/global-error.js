'use client';

// Next.js'in özel dosyası: root layout'un KENDİSİ çökerse (ör. NextIntlClientProvider hatası)
// devreye girer. Bu noktada tema/i18n context'i garanti olmadığı için tamamen bağımsız,
// minimal ve iki dilde (TR/EN) sabit metinlerle yazıldı.
export default function GlobalError({ reset }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '64px 16px' }}>
        <h1>Bir şeyler ters gitti / Something went wrong</h1>
        <p style={{ color: '#666' }}>
          Lütfen sayfayı yenileyin. / Please refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 16,
            padding: '10px 24px',
            borderRadius: 999,
            border: 'none',
            background: '#B8355F',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Tekrar Dene / Try Again
        </button>
      </body>
    </html>
  );
}
