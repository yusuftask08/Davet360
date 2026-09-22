'use client';

import { useTranslations } from 'next-intl';
import { Menu } from '@repo/ui';
import { IconMenu } from './IconMenu.jsx';
import { LocaleSwitcher } from './LocaleSwitcher.jsx';

// Hamburger (3 çizgi) butonu — hesap butonundan (AuthNav) kasıtlı olarak ayrı, tek bir
// birleşik pilla sıkıştırılmadı. Şimdilik sadece dil seçimi barındırıyor, ileride başka
// site ayarları da buraya eklenebilir. Aç/kapa mantığı IconMenu'de yaşıyor.
export function SettingsMenu() {
  const t = useTranslations('nav');

  return (
    <IconMenu icon={<Menu size={18} strokeWidth={2} aria-hidden="true" />} label={t('settings')}>
      <span className="site-navbar__icon-panel-label">{t('language')}</span>
      <LocaleSwitcher />
    </IconMenu>
  );
}
