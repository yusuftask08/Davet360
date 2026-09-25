import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@repo/ui';

// Vendor detay sayfası üç ayrı isteği paralel bekliyor (vendor + yorumlar + benzer işletmeler) —
// en uzun bekleyen sayfa olduğu için iskelet burada en çok işe yarıyor.
export default async function VendorLoading() {
  const t = await getTranslations('common');

  return (
    <main className="container page-main">
      <div role="status" aria-label={t('loading')}>
        <Skeleton width="60%" height={14} />
        {/* Hero: solda büyük görsel, sağda 2x2 küçük görsel ızgarası (vendor-hero ile aynı düzen) */}
        <div className="vendor-hero" style={{ marginTop: 'var(--space-md)' }}>
          <Skeleton height="auto" radius="0" style={{ aspectRatio: '4 / 3' }} />
          <div className="vendor-hero__thumbs">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="auto" radius="0" />
            ))}
          </div>
        </div>

        <div className="vendor-detail-grid">
          <div>
            <Skeleton width={180} height={24} radius="var(--radius-full)" />
            <Skeleton width="65%" height={32} style={{ marginTop: 'var(--space-sm)' }} />
            <Skeleton width="25%" height={14} style={{ marginTop: 'var(--space-sm)' }} />
            <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gap: 10 }}>
              <Skeleton height={14} />
              <Skeleton height={14} />
              <Skeleton width="80%" height={14} />
            </div>
          </div>
          <aside className="vendor-detail-aside">
            <Skeleton height={320} radius="var(--radius-lg)" />
          </aside>
        </div>
      </div>
    </main>
  );
}
