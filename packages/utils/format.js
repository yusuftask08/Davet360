// Büyük/küçük harf İ/I ayrımı JS'in locale-bağımsız toLowerCase()'i ile bozulur
// (ör. "İstanbul".toLowerCase() -> "i̇stanbul", birleşik nokta karakteriyle).
// Bu yüzden Türkçe karakterler ÖNCE eşlenir, toLowerCase() SONRA çağrılır.
const TR_CHAR_MAP = {
  İ: 'i', I: 'i', ı: 'i',
  Ğ: 'g', ğ: 'g',
  Ü: 'u', ü: 'u',
  Ş: 's', ş: 's',
  Ö: 'o', ö: 'o',
  Ç: 'c', ç: 'c',
};

export function slugify(text) {
  return text
    .split('')
    .map((ch) => TR_CHAR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatPhone(phone) {
  return phone.replace(/[^\d+]/g, '');
}

export function formatDate(date, locale = 'tr-TR') {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(date),
  );
}
