import { z } from 'zod';

// TR telefon: opsiyonel +90/0 öneki + 9 hane (mobil 5xx veya sabit hat 2xx/3xx/4xx).
export const PHONE_REGEX = /^(\+90|0)?[1-9][0-9]{9}$/;

export function normalizePhone(value) {
  return value.replace(/[\s-]/g, '');
}

export function isValidPhone(value) {
  return PHONE_REGEX.test(normalizePhone(value));
}

// Tek merkezi telefon şeması — auth/vendor/lead hepsi bunu kullanır, format kuralı iki yerde
// tekrar yazılmaz (DRY). optional:true'da alan hiç gönderilmezse (undefined) validasyona girmez.
export function phoneSchema({ optional = false } = {}) {
  const base = z.string().refine(isValidPhone, {
    message: 'Geçerli bir telefon numarası girin (örn. 0532 123 45 67)',
  });
  return optional ? base.optional() : base;
}
