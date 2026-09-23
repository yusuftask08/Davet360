'use client';

import { usePathname } from 'next/navigation';

// Next.js'in özel dosyası: root layout'un KENDİSİ çökerse (ör. NextIntlClientProvider hatası)
// devreye girer. Bu noktada tema/i18n context'i garanti olmadığı için tamamen bağımsız,
// minimal ve iki dilde (TR/EN) sabit metinlerle yazıldı. `lang` sadece görüntü metnine göre
// değil, URL'deki locale segmentine göre (next-intl context'i çökmüş olabileceği için ondan
// bağımsız) belirlenir — usePathname router'dan gelir, çöken provider'a bağımlı değildir.
export default function GlobalError({ reset }) {
  const pathname = usePathname();
  const lang = pathname?.startsWith('/en') ? 'en' : 'tr';

  return (
    <html lang={lang}>
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
