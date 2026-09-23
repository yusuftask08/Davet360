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

const BACK_VOWELS = new Set(['a', 'ı', 'o', 'u']);
const FRONT_VOWELS = new Set(['e', 'i', 'ö', 'ü']);
// "İstanbul" -> "i" için doğru sonuç versin diye Türkçe karakterler önce normalize edilir
// (TR_CHAR_MAP zaten İ/I/ı hepsini 'i' yapıyor — ama 'i' ön ünlü, 'ı' arka ünlü olduğu için
// burada ayrı bir eşleme gerekiyor, slugify'ın map'i bu ayrımı kasıtlı olarak siler).
const VOWEL_QUALITY = { a: 'back', ı: 'back', o: 'back', u: 'back', e: 'front', i: 'front', ö: 'front', ü: 'front' };

// Türkiye şehir adlarına "-da/-de" (bulunma hâli eki) doğru ünlü uyumuyla ekler:
// "Ankara" -> "Ankara'da", "Mersin" -> "Mersin'de". Son ünlüye bakar, ünsüzle bitse de
// (İstanbul) sesli ile bitse de (Bursa) aynı kural geçerli — bulunma eki tampon ünsüz istemez.
export function toLocativeCase(cityName) {
  const chars = cityName.toLowerCase().split('').reverse();
  const lastVowel = chars.find((ch) => VOWEL_QUALITY[ch]);
  const suffix = lastVowel && VOWEL_QUALITY[lastVowel] === 'front' ? 'de' : 'da';
  return `${cityName}'${suffix}`;
}

// Kullanıcı girdisini RegExp'e vermeden önce özel karakterleri kaçırır — aksi halde arama
// kutusuna yazılan bir regex metakarakteri (ör. "(a+)+$") backend'de ReDoS'a (event loop'u
// kilitleyen katastrofik backtracking) yol açabilir.
export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatPhone(phone) {
  return phone.replace(/[^\d+]/g, '');
}

export function formatDate(date, locale = 'tr-TR') {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(date),
  );
}
