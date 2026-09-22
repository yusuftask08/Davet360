// Türkiye'nin 81 ili — plaka koduna göre sıralı. Arama/otomatik tamamlama gibi genel
// amaçlı UI listeleri için kullanılır; vendor'a özel şehir verisi değildir.
export const TR_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye',
  'Düzce',
];

const TR_UPPER_MAP = { i: 'İ', ı: 'I' };

function toTurkishUpper(value) {
  return value
    .split('')
    .map((char) => TR_UPPER_MAP[char] ?? char.toUpperCase())
    .join('');
}

// Türkçe karakter/case duyarsız arama: İstanbul ararken "ist", "İst" ya da "IST" hepsi eşleşmeli.
export function searchCities(query, limit = 8) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const normalized = toTurkishUpper(trimmed);
  return TR_CITIES.filter((city) => toTurkishUpper(city).startsWith(normalized)).slice(0, limit);
}
