// "Davet edilebilecek" her etkinlik türü + hizmet kategorisi tek listede — yeni kategori
// eklemek sadece buraya bir satır eklemek demek, şema/route hiçbir yerde değişmez.
export const CATEGORIES = [
  { slug: 'dugun-mekani', label: 'Düğün Mekanı' },
  { slug: 'dugun-organizasyonu', label: 'Düğün Organizasyonu' },
  { slug: 'nisan-organizasyonu', label: 'Nişan Organizasyonu' },
  { slug: 'kina-gecesi', label: 'Kına Gecesi Organizasyonu' },
  { slug: 'sunnet-organizasyonu', label: 'Sünnet Organizasyonu' },
  { slug: 'dogum-gunu-organizasyonu', label: 'Doğum Günü / Yaş Günü Organizasyonu' },
  { slug: 'baby-shower', label: 'Baby Shower Organizasyonu' },
  { slug: 'mezuniyet-organizasyonu', label: 'Mezuniyet Organizasyonu' },
  { slug: 'kurumsal-etkinlik', label: 'Kurumsal Etkinlik Organizasyonu' },
  { slug: 'orkestra-muzik', label: 'Orkestra / Müzik' },
  { slug: 'fotograf-video', label: 'Fotoğraf & Video' },
  { slug: 'catering-ikram', label: 'Catering & İkram' },
  { slug: 'pasta-tatli', label: 'Pasta & Tatlı' },
  { slug: 'dekorasyon-balon', label: 'Dekorasyon & Balon' },
  { slug: 'davetiye', label: 'Davetiye & Kırtasiye' },
  { slug: 'gelinlik-damatlik', label: 'Gelinlik & Damatlık' },
  { slug: 'kuafor-makyaj', label: 'Gelin Saçı & Makyaj' },
  { slug: 'animasyon-cocuk', label: 'Çocuk Animasyonu & Karakterler' },
];

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug);

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((category) => category.slug === slug) ?? null;
}
