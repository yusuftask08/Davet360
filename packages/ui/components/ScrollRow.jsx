'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Airbnb'nin ana sayfa satırlarındaki gibi yatay kaydırmalı liste + masaüstünde sağ/sol ok
// butonları. Dokunmatikte parmakla kaydırmak doğal olduğu için oklar sadece geniş ekranda
// (CSS ile) görünür. Başta/sonda olan ok gizlenir — Airbnb de böyle yapar.
// prevLabel/nextLabel çağıran app'ten çevrilmiş gelir (paylaşılan paket next-intl'e erişemez).
export function ScrollRow({ children, prevLabel = 'Previous', nextLabel = 'Next', className }) {
  const scrollerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    // 1px tolerans: tarayıcılar kesirli scrollLeft döndürebiliyor, tam eşitlik hiç tutmayabilir.
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    // İçerik veya pencere boyutu değişince (görsel yüklenmesi, ekran döndürme) oklar
    // yeniden hesaplanmalı — yoksa "sona gelindi" durumu yanlış kalır.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [sync]);

  function scrollBy(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    // Bir ekran dolusunun biraz azı — kullanıcı nerede kaldığını kaybetmesin diye
    // kenardaki kart kısmen görünür kalır.
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  return (
    <div className="ui-scroll-row">
      <div ref={scrollerRef} className={className ? `hscroll ${className}` : 'hscroll'}>
        {children}
      </div>
      {!atStart && (
        <button
          type="button"
          className="ui-scroll-row__arrow ui-scroll-row__arrow--prev"
          onClick={() => scrollBy(-1)}
          aria-label={prevLabel}
        >
          <ChevronLeft size={18} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          className="ui-scroll-row__arrow ui-scroll-row__arrow--next"
          onClick={() => scrollBy(1)}
          aria-label={nextLabel}
        >
          <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
