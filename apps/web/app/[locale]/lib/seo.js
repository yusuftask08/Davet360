// Next.js child sayfaların generateMetadata'sı openGraph objesini set ettiğinde layout.js'teki
// varsayılan siteName/locale/type alanlarını deep-merge ETMEZ, tamamen üzerine yazar — bu yüzden
// her sayfa kendi openGraph'ını bu helper'la kurar. Aynı şekilde iki dilli site (tr/en) olduğu
// için her sayfa hreflang (alternates.languages) belirtmeli, aksi halde Google dil eşleniklerini
// göremez.
export function buildAlternates(locale, path) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      tr: `/tr${path}`,
      en: `/en${path}`,
      'x-default': `/tr${path}`,
    },
  };
}

export function buildOpenGraph(locale, { title, description, images, type = 'website' }) {
  return {
    type,
    siteName: 'Merasim360',
    locale: locale === 'tr' ? 'tr_TR' : 'en_US',
    title,
    description,
    images,
  };
}

// Aynı sebep: layout.js'teki varsayılan twitter objesi de child sayfa kendi twitter/openGraph'ını
// set ettiğinde deep-merge olmuyor, vendor/blog gibi sayfalar generic "Merasim360" kartına düşüyor.
export function buildTwitter({ title, description, images }) {
  return {
    card: images?.length ? 'summary_large_image' : 'summary',
    title,
    description,
    images,
  };
}
