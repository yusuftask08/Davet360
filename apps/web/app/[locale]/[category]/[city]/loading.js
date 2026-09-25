import { getTranslations } from 'next-intl/server';
import { Skeleton, VendorCardSkeleton } from '@repo/ui';

export default async function CategoryCityLoading() {
  const t = await getTranslations('common');

  return (
    <main className="container page-main">
      <div role="status" aria-label={t('loading')}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="45%" height={30} style={{ marginTop: 'var(--space-md)' }} />
        {/* Filtre çubuğu — gerçek sayfada sabit yükseklikli tek bir satır */}
        <Skeleton height={58} radius="var(--radius-full)" style={{ marginTop: 'var(--space-lg)' }} />
        <div className="vendor-grid" style={{ marginTop: 'var(--space-xl)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
