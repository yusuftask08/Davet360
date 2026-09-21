'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../../../i18n/navigation.js';

const LOCALES = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="locale-switcher" role="group" aria-label="Dil / Language">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`locale-switcher__option${code === locale ? ' locale-switcher__option--active' : ''}`}
          aria-current={code === locale}
          onClick={() => router.replace(pathname, { locale: code })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
