'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    // Dev'de SW kayıtlı kalırsa cache-first stratejisi yüzünden her değişiklik eski
    // sürümün üstüne gizlenir — sonsuz "neden güncellenmiyor" karmaşasına yol açar.
    // Sadece production build'de kayıt olur.
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return null;
}
