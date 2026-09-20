'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../../../i18n/navigation.js';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(event) {
    router.replace(pathname, { locale: event.target.value });
  }

  return (
    <select
      aria-label="Dil / Language"
      value={locale}
      onChange={handleChange}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        padding: '4px 10px',
        fontSize: 'var(--font-size-sm)',
        background: 'var(--color-surface)',
        color: 'inherit',
      }}
    >
      <option value="tr">TR</option>
      <option value="en">EN</option>
    </select>
  );
}
