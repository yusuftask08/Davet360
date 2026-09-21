// Şimdilik tüm kategoriler için ortak tek liste — Vendor.amenities alanı düz string dizisi
// olarak saklanır (sabit enum değil), bu sayede ileride kategoriye özel listelere geçmek
// şema değişikliği gerektirmez, sadece bu listeyi kategoriye göre filtrelemek/çoğaltmak yeterli olur.
export const AMENITIES = [
  { key: 'parking', label: 'Otopark' },
  { key: 'indoor', label: 'İç Mekan' },
  { key: 'outdoor', label: 'Dış Mekan' },
  { key: 'catering_included', label: 'Catering Dahil' },
  { key: 'valet', label: 'Vale' },
  { key: 'ac', label: 'Klima' },
  { key: 'wifi', label: 'Wifi' },
  { key: 'wheelchair_accessible', label: 'Engelli Erişimi' },
  { key: 'sound_system', label: 'Ses Sistemi' },
  { key: 'accommodation_nearby', label: 'Yakında Konaklama' },
];

export const AMENITY_KEYS = AMENITIES.map((a) => a.key);
