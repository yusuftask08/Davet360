'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '../../../i18n/navigation.js';

export function AuthNav() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') ?? 'null'));
    } catch {
      setUser(null);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  }

  if (!user) {
    return <Link href="/login">{t('login')}</Link>;
  }

  return (
    <span style={{ display: 'inline-flex', gap: 'var(--space-md)', alignItems: 'center' }}>
      <Link href="/account">{t('account')}</Link>
      <Link href="/favorites">{t('favorites')}</Link>
      <button
        type="button"
        onClick={handleLogout}
        style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}
      >
        {t('logout')}
      </button>
    </span>
  );
}
