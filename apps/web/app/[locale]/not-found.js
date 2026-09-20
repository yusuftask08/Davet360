import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation.js';

export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <main className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)', textAlign: 'center' }}>
      <h1>{t('notFoundTitle')}</h1>
      <p style={{ color: 'var(--color-neutral-500)' }}>{t('notFoundDescription')}</p>
      <Link href="/" className="ui-button ui-button--primary">
        {t('goHome')}
      </Link>
    </main>
  );
}
