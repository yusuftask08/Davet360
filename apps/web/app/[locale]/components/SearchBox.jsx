'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
    <form onSubmit={handleSubmit} role="search" style={{ display: 'flex' }}>
      <input
        type="search"
        className="ui-input"
        placeholder={t('placeholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ maxWidth: 220, borderRadius: 'var(--radius-full)' }}
        aria-label={t('placeholder')}
      />
    </form>
  );
}
