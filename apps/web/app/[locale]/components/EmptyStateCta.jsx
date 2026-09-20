import { getTranslations } from 'next-intl/server';
import { Card } from '@repo/ui';

// Kategori/şehirde henüz vendor yoksa boş bir ekran yerine büyüme fırsatına çevrilir —
// panel'in vendor kayıt sayfasına yönlendiren bir CTA gösterilir.
export async function EmptyStateCta() {
  const t = await getTranslations('category');
  const panelUrl = process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3001';

  return (
    <Card style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
      <p style={{ margin: '0 0 var(--space-md)', color: 'var(--color-neutral-700)' }}>{t('emptyCtaText')}</p>
      <a href={`${panelUrl}/register`} className="ui-button ui-button--primary">
        {t('emptyCtaButton')}
      </a>
    </Card>
  );
}
