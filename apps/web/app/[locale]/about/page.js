import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '../lib/seo.js';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return { title: t('title'), description: t('intro'), alternates: buildAlternates(locale, '/about') };
}

export default async function AboutPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.about');

  return (
    <main className="container" style={{ maxWidth: 720, paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <h1>{t('title')}</h1>
      <p style={{ fontSize: 'var(--font-size-lg)', lineHeight: 1.6 }}>{t('intro')}</p>

      <h2 style={{ marginTop: 'var(--space-xl)' }}>{t('missionHeading')}</h2>
      <p style={{ lineHeight: 1.7 }}>{t('missionText')}</p>

      <h2 style={{ marginTop: 'var(--space-xl)' }}>{t('howHeading')}</h2>
      <p style={{ lineHeight: 1.7 }}>{t('howText')}</p>

      <h2 style={{ marginTop: 'var(--space-xl)' }}>{t('freeHeading')}</h2>
      <p style={{ lineHeight: 1.7 }}>{t('freeText')}</p>
    </main>
  );
}
