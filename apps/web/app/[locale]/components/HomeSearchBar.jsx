'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CATEGORIES } from '@repo/constants';
import { slugify } from '@repo/utils';
import { Search } from '@repo/ui';
import { useRouter } from '../../../i18n/navigation.js';

// Airbnb'nin "Yer / Ne zaman / Kişiler" segmentli arama çubuğunun bizim ürünümüze uyarlanmış
// hâli — tarih/misafir sayısı bize uygun değil (biz rezervasyon değil, teklif talebi
// platformuyuz), bunun yerine kategori + şehir soruyoruz. Şehir serbest metin: hedef
// kategori+şehir sayfası artık veri yoksa 404 değil "ilk işletme siz olun" gösteriyor.
export function HomeSearchBar() {
  const t = useTranslations();
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [city, setCity] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedCity = city.trim();
    router.push(trimmedCity ? `/${category}/${slugify(trimmedCity)}` : `/${category}`);
  }

  return (
    <form onSubmit={handleSubmit} className="home-search">
      <div className="home-search__field">
        <label htmlFor="home-search-category">{t('home.searchCategoryLabel')}</label>
        <select id="home-search-category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {t(`categories.${c.slug}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="home-search__divider" aria-hidden="true" />
      <div className="home-search__field">
        <label htmlFor="home-search-city">{t('home.searchCityLabel')}</label>
        <input
          id="home-search-city"
          type="text"
          placeholder={t('home.searchCityPlaceholder')}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <button type="submit" className="home-search__submit" aria-label={t('home.searchSubmit')}>
        <Search size={16} strokeWidth={2.5} aria-hidden="true" />
        <span className="home-search__submit-label">{t('home.searchSubmit')}</span>
      </button>
    </form>
  );
}
