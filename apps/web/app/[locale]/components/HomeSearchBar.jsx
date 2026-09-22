'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CATEGORIES, searchCities } from '@repo/constants';
import { slugify } from '@repo/utils';
import { Search } from '@repo/ui';
import { useRouter } from '../../../i18n/navigation.js';

// Airbnb'nin "Yer / Ne zaman / Kişiler" segmentli arama çubuğunun bizim ürünümüze uyarlanmış
// hâli — tarih/misafir sayısı bize uygun değil (biz rezervasyon değil, teklif talebi
// platformuyuz), bunun yerine kategori + şehir soruyoruz. Şehir alanı Türkiye'nin 81 ilini
// öneren bir autocomplete: serbest metin de kabul edilir (yazıp direkt Enter'a basılabilir),
// hedef kategori+şehir sayfası artık veri yoksa 404 değil "ilk işletme siz olun" gösteriyor.
export function HomeSearchBar() {
  const t = useTranslations();
  const router = useRouter();
  const listboxId = useId();
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef(null);

  function goToCity(value) {
    const trimmedCity = value.trim();
    router.push(trimmedCity ? `/${category}/${slugify(trimmedCity)}` : `/${category}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    goToCity(city);
  }

  function handleCityChange(event) {
    const value = event.target.value;
    setCity(value);
    setSuggestions(searchCities(value));
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function selectCity(value) {
    setCity(value);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (!isOpen || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectCity(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleBlur() {
    // Öneriye tıklama olayının çalışabilmesi için kapanmayı bir tık geciktiriyoruz —
    // yoksa blur, click'ten önce tetiklenip listeyi kaybediyor.
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }

  function handleFocus() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (city.trim()) setSuggestions(searchCities(city));
    setIsOpen(true);
  }

  return (
    <form onSubmit={handleSubmit} className="home-search">
      <Search size={18} strokeWidth={2} className="home-search__leading-icon" aria-hidden="true" />
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
      <div className="home-search__field home-search__field--autocomplete">
        <label htmlFor="home-search-city">{t('home.searchCityLabel')}</label>
        <input
          id="home-search-city"
          type="text"
          role="combobox"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={t('home.searchCityPlaceholder')}
          value={city}
          onChange={handleCityChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {isOpen && suggestions.length > 0 && (
          <ul id={listboxId} role="listbox" className="home-search__suggestions">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={index === activeIndex ? 'is-active' : ''}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectCity(suggestion)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="home-search__submit" aria-label={t('home.searchSubmit')}>
        <Search size={16} strokeWidth={2.5} aria-hidden="true" />
        <span className="home-search__submit-label">{t('home.searchSubmit')}</span>
      </button>
    </form>
  );
}
