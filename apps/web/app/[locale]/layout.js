import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '@repo/ui/theme.css';
import '@repo/ui/styles.css';
import './globals.css';
import { routing } from '../../i18n/routing.js';
import { RegisterServiceWorker } from './register-sw.js';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { RouteProgress } from './components/RouteProgress.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { buildAlternates } from './lib/seo.js';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params: { locale } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3600';
  const description =
    locale === 'en'
      ? 'Compare wedding venues, engagement organizers, orchestras and photo/video vendors, request a free quote.'
      : 'Düğün mekanı, nişan organizasyonu, orkestra ve fotoğraf/video hizmetlerini karşılaştırın, ücretsiz teklif alın.';

  return {
    // OG görselinin (ve diğer göreli metadata URL'lerinin) production'da doğru mutlak
    // adrese çözülmesi için gerekli — yoksa Next.js localhost'a düşer.
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Merasim360',
      template: '%s | Merasim360',
    },
    description,
    manifest: '/manifest.json',
    // Alt sayfalar kendi alternates'ini set ederek bunu override eder — burası sadece
    // kendi alternates'i olmayan sayfalar (anasayfa gibi) için hreflang varsayılanı.
    alternates: buildAlternates(locale, ''),
    // Vendor detay ve blog sayfaları kendi openGraph.images'ını set ederek bunun üzerine
    // yazar — burası sadece onların dışındaki sayfalar (anasayfa, kategori vb.) için varsayılan.
    openGraph: {
      type: 'website',
      siteName: 'Merasim360',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      title: 'Merasim360',
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Merasim360',
      description,
    },
  };
}

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={jakarta.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Klavye kullanıcıları için — sticky navbar + kategori şeridi olmasa bile her
              sayfada var, tab ile navbarı atlayıp doğrudan içeriğe geçmeyi sağlar. */}
          <a href="#main-content" className="skip-link">
            {locale === 'en' ? 'Skip to content' : 'İçeriğe geç'}
          </a>
          <Suspense fallback={null}>
            <RouteProgress />
          </Suspense>
          <Navbar />
          {/* Her sayfa zaten kendi <main>'ini render ediyor — burada ikinci bir <main>
              açıp iç içe landmark oluşturmak yerine düz bir div skip-link hedefi olarak yeter. */}
          <div id="main-content">{children}</div>
          <Footer />
          <BottomNav />
          <RegisterServiceWorker />
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          // Self-hosted analytics — script kendi Umami sunucumuzdan gelir, üçüncü parti servis yok.
          <script
            defer
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </body>
    </html>
  );
}
