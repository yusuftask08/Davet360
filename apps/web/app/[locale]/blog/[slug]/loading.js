import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@repo/ui';

export default async function BlogPostLoading() {
  const t = await getTranslations('common');

  return (
    <main className="container page-main" style={{ maxWidth: 760 }}>
      <div role="status" aria-label={t('loading')}>
        <Skeleton width="50%" height={14} />
        <Skeleton width="85%" height={34} style={{ marginTop: 'var(--space-md)' }} />
        <Skeleton height={280} radius="var(--radius-lg)" style={{ marginTop: 'var(--space-lg)' }} />
        <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={i === 5 ? '60%' : '100%'} height={14} />
          ))}
        </div>
      </div>
    </main>
  );
}
