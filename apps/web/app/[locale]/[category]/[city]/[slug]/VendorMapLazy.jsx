'use client';

import dynamic from 'next/dynamic';

// Leaflet (~150KB) sadece konumu olan vendor'larda gerekiyor ve `window`'a dokunduğu için
// sunucuda render edilemez. `ssr: false` Server Component içinde yok sayılıyor (Next 14) —
// sayfa server component olduğundan dinamik import bu client sarmalayıcıda yapılır.
export const VendorMapLazy = dynamic(() => import('./VendorMap.jsx').then((mod) => mod.VendorMap), {
  ssr: false,
  loading: () => <div style={{ height: 260, borderRadius: 'var(--radius-lg)', background: 'var(--color-neutral-100)' }} />,
});
