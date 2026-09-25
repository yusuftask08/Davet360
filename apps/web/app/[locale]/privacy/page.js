import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '../lib/seo.js';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });
  return { title: t('title'), description: t('intro'), alternates: buildAlternates(locale, '/privacy') };
}

export default async function PrivacyPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.privacy');
  const sections = t.raw('sections');

  return (
    <main className="container page-main" style={{ maxWidth: 720 }}>
      <h1>{t('title')}</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>{t('intro')}</p>

      {sections.map((section) => (
        <section key={section.heading} style={{ marginTop: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{section.heading}</h2>
          <p style={{ lineHeight: 1.7 }}>{section.body}</p>
        </section>
      ))}
    </main>
  );
}
