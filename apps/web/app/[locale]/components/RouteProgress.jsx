'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Next.js App Router'da yerleşik bir "route değişiyor" event'i yok — bu yüzden iki sinyali
// birleştiriyoruz: (1) document üzerindeki iç link tıklamalarını yakalayıp çubuğu hemen
// başlatmak (navigasyonun asıl geciktiği an — RSC payload'ı beklenirken), (2) pathname/
// searchParams değiştiğinde navigasyonun bittiğini anlayıp çubuğu tamamlamak.
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    function handleClick(event) {
      const anchor = event.target.closest('a');
      if (!anchor) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

      setVisible(true);
      setProgress(15);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((p) => (p < 85 ? p + (85 - p) * 0.1 : p));
      }, 200);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    clearInterval(timerRef.current);
    setProgress(100);
    const hideTimeout = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(hideTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="route-progress" aria-hidden="true">
      <div className="route-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
