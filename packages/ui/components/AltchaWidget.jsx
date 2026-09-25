'use client';

import { useEffect, useRef } from 'react';

// Public/anonim formlarda (kayıt, teklif) spam korumasının görünen kısmı. `onSolved` çözülen
// payload'ı (base64) verir, widget resetlenirse null gelir — form submit'i buna göre kilitlenir.
export function AltchaWidget({ challengeUrl, onSolved }) {
  const ref = useRef(null);

  useEffect(() => {
    import('altcha');
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    function handleStateChange(event) {
      onSolved(event.detail.state === 'verified' ? event.detail.payload : null);
    }

    el.addEventListener('statechange', handleStateChange);
    return () => el.removeEventListener('statechange', handleStateChange);
  }, [onSolved]);

  return <altcha-widget ref={ref} challenge={challengeUrl} hidefooter hidelogo />;
}
