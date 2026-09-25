import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '../lib/seo.js';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.faq' });
  return {
    title: t('title'),
    description: t('intro'),
    alternates: buildAlternates(locale, '/faq'),
  };
}

// Homepage'in "gez, kart kart bak" akışını kesmesin diye SSS oradan buraya taşındı —
// FAQPage schema'sı (Google rich snippet) burada yaşamaya devam ediyor.
export default async function FaqPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [1, 2, 3, 4, 5].map((n) => ({
      '@type': 'Question',
      name: t(`faq.q${n}`),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq.a${n}`) },
    })),
  };

  return (
    <main className="container page-main" style={{ maxWidth: 720 }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <h1>{t('pages.faq.title')}</h1>
      <p style={{ fontSize: 'var(--font-size-lg)', lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
        {t('pages.faq.intro')}
      </p>

      <div className="faq-list" style={{ marginTop: 'var(--space-xl)' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <details key={n} className="faq-list__item">
            <summary>{t(`faq.q${n}`)}</summary>
            <p>{t(`faq.a${n}`)}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
