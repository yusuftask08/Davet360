'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from '@repo/ui';
import { useRouter } from '../../../i18n/navigation.js';

export function SearchBox({ initialValue = '' }) {
  const t = useTranslations('search');
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event) {
    event.preventDefault();
    const query = value.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="site-search">
      <Search size={18} strokeWidth={2} className="site-search__icon" aria-hidden="true" />
      <input
        type="search"
        placeholder={t('placeholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={t('placeholder')}
      />
      <button type="submit" className="site-search__submit" aria-label={t('placeholder')}>
        <Search size={16} strokeWidth={2.25} aria-hidden="true" />
      </button>
    </form>
  );
}
