'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CategoryIcon, Menu, X } from '@repo/ui';
import { Link, usePathname } from '../../../i18n/navigation.js';
import { LocaleSwitcher } from './LocaleSwitcher.jsx';
import { SPECIAL_DAY_CATEGORIES, WEDDING_CATEGORIES } from '../lib/navGroups.js';

// Mobil header'ın sol üstündeki hamburger — soldan açılan tam yükseklikte bir çekmece.
// Masaüstündeki küçük ayarlar menüsünün (SettingsMenu) aksine burada tüm site gezinmesi var:
// kategoriler, içerik sayfaları, işletme kaydı ve dil seçimi. Mobilde kategori şeridi header'dan
// kaldırıldığı için kategorilere ulaşmanın ana yolu burası.
export function MobileMenu({ panelUrl }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Bir linke tıklanıp sayfa değişince çekmece açık kalmasın.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    // Çekmece açıkken arkadaki sayfa kaymasın.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="mobile-menu__trigger"
        onClick={() => setOpen(true)}
        aria-label={t('nav.menu')}
        aria-expanded={open}
      >
        <Menu size={22} strokeWidth={2} aria-hidden="true" />
      </button>
      {/* Portal: header'daki backdrop-filter, içindeki position:fixed öğeler için yeni bir
          containing block oluşturuyor — çekmece header'ın 56px'ine hapsoluyordu. */}
      {open && createPortal(
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
          <button
            type="button"
            className="mobile-menu__backdrop"
            aria-label={t('nav.closeMenu')}
            onClick={() => setOpen(false)}
          />
          <nav className="mobile-menu__panel">
            <div className="mobile-menu__header">
              <Link href="/" className="site-navbar__logo">
                Merasim<span>360</span>
              </Link>
              <button
                type="button"
                className="mobile-menu__close"
                onClick={() => setOpen(false)}
                aria-label={t('nav.closeMenu')}
              >
                <X size={22} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {[
              { label: t('nav.weddingEngagement'), slugs: WEDDING_CATEGORIES },
              { label: t('nav.specialDays'), slugs: SPECIAL_DAY_CATEGORIES },
            ].map((group) => (
              <div key={group.label}>
                <p className="mobile-menu__label">{group.label}</p>
                <ul className="mobile-menu__list">
                  {group.slugs.map((slug) => (
                    <li key={slug}>
                      <Link href={`/${slug}`} className="mobile-menu__link">
                        <CategoryIcon slug={slug} size={20} strokeWidth={1.5} />
                        {t(`categories.${slug}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <ul className="mobile-menu__list mobile-menu__list--plain">
              <li><Link href="/blog" className="mobile-menu__link">{t('nav.blog')}</Link></li>
              <li><Link href="/about" className="mobile-menu__link">{t('footer.about')}</Link></li>
              <li><Link href="/faq" className="mobile-menu__link">{t('pages.faq.title')}</Link></li>
              <li><Link href="/contact" className="mobile-menu__link">{t('footer.contact')}</Link></li>
            </ul>

            <a href={`${panelUrl}/register`} className="mobile-menu__vendor-cta">
              {t('footer.addBusiness')}
            </a>

            <div className="mobile-menu__footer">
              <span className="mobile-menu__label">{t('nav.language')}</span>
              <LocaleSwitcher />
            </div>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
