import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from './ContactForm.jsx';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return { title: t('title'), description: t('intro') };
}

export default async function ContactPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.contact');

  return (
    <main className="container" style={{ maxWidth: 560, paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <h1>{t('title')}</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>{t('intro')}</p>
      <ContactForm />
    </main>
  );
}
