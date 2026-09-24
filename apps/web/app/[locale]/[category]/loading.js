import { getTranslations } from 'next-intl/server';
import { Skeleton, VendorCardSkeleton } from '@repo/ui';

// Kategori listesi sunucuda veri çekerken gösterilir. Tek başına progress bar yeterli değil —
// iskelet, gelecek düzeni (başlık + kart ızgarası) önceden çizdiği için içerik geldiğinde
// sayfa zıplamaz ve bekleme daha kısa hissettirir.
export default async function CategoryLoading() {
  const t = await getTranslations('common');

  return (
    <main className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <div role="status" aria-label={t('loading')}>
        <Skeleton width="45%" height={14} />
        <Skeleton width="55%" height={30} style={{ marginTop: 'var(--space-md)' }} />
        <Skeleton width="80%" height={14} style={{ marginTop: 'var(--space-sm)' }} />
        <div className="vendor-grid" style={{ marginTop: 'var(--space-xl)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
