'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../../../../../i18n/navigation.js';

// LeadForm ile aynı kural: işletmeyle WhatsApp üzerinden de olsa iletişime geçmek için giriş
// yapmış olmak gerekiyor — aksi halde LeadForm'u giriş zorunlu yapmanın bir anlamı kalmazdı,
// misafir kullanıcı WhatsApp'a tıklayıp aynı şekilde iletişime geçebilirdi.
export function WhatsAppButton({ whatsapp }) {
  const t = useTranslations('vendor');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('user')));
  }, []);

  if (!whatsapp) return null;

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="ui-button ui-button--secondary">
        {t('whatsapp')}
      </Link>
    );
  }

  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ui-button ui-button--secondary"
    >
      {t('whatsapp')}
    </a>
  );
}
