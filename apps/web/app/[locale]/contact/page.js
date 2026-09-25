import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from './ContactForm.jsx';
import { buildAlternates } from '../lib/seo.js';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return { title: t('title'), description: t('intro'), alternates: buildAlternates(locale, '/contact') };
}

export default async function ContactPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.contact');

  return (
    <main className="container page-main" style={{ maxWidth: 560 }}>
      <h1>{t('title')}</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>{t('intro')}</p>
      <ContactForm />
    </main>
  );
}
