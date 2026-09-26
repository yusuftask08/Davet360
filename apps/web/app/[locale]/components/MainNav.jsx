'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, CategoryIcon, ClipboardList, Heart, Home, MessageCircle, Sparkles, HelpCircle } from '@repo/ui';
import { Link, usePathname } from '../../../i18n/navigation.js';
import { SPECIAL_DAY_CATEGORIES, SPECIAL_DAY_SERVICES, WEDDING_CATEGORIES } from '../lib/navGroups.js';

// Açılış/kapanış gecikmeleri — fare menü başlıkları arasında geçerken ya da başlıktan panele
// inerken panel titremesin.
const OPEN_DELAY = 80;
const CLOSE_DELAY = 180;

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// Masaüstü ana gezinme — The Knot düzeni: logonun altında menü başlıkları, üzerine gelince
// header genişliğinde açılan panel (solda kısayollar, ortada kategori sütunları, sağda
// görselli kartlar). Klavyede Enter/Space ile açılır, Escape kapatır.
export function MainNav({ teamTiles, panelUrl }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [openId, setOpenId] = useState(null);
  const timerRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    if (!openId) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpenId(null);
    }
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) setOpenId(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openId]);

  function schedule(id, delay) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpenId(id), delay);
  }

  const categoryLink = (slug) => (
    <li key={slug}>
      <Link href={`/${slug}`} className="mega__link">
        {t(`categories.${slug}`)}
      </Link>
    </li>
  );

  const shortcuts = (
    <div className="mega__shortcuts">
      <p className="mega__col-title">{t('nav.myVendors')}</p>
      <ul>
        <li>
          <Link href="/account" className="mega__shortcut">
            <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('nav.myLeads')}
          </Link>
        </li>
        <li>
          <Link href="/account" className="mega__shortcut">
            <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('nav.messages')}
          </Link>
        </li>
        <li>
          <Link href="/favorites" className="mega__shortcut">
            <Heart size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('nav.favorites')}
          </Link>
        </li>
      </ul>
    </div>
  );

  const tiles = (heading, items) =>
    items.length > 0 && (
      <div className="mega__tiles">
        <p className="mega__eyebrow">{heading}</p>
        <div className="mega__tile-grid">
          {items.map((tile) => (
            <Link key={tile.href} href={tile.href} className="mega__tile">
              <span className="mega__tile-media">
                {tile.image ? (
                  <Image src={tile.image} alt="" fill sizes="160px" style={{ objectFit: 'cover' }} />
                ) : (
                  <CategoryIcon slug={tile.slug} size={32} strokeWidth={1.5} />
                )}
              </span>
              <span className="mega__tile-label">{tile.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );

  const menus = [
    {
      id: 'planning',
      label: t('nav.planning'),
      href: '/',
      panel: (
        <>
          <div className="mega__shortcuts">
            <ul>
              <li>
                <Link href="/" className="mega__shortcut">
                  <Home size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/account" className="mega__shortcut">
                  <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t('nav.myLeads')}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="mega__shortcut">
                  <Heart size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t('nav.favorites')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="mega__shortcut">
                  <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t('nav.guide')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="mega__shortcut">
                  <HelpCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t('nav.faq')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="mega__tiles mega__tiles--wide">
            <p className="mega__eyebrow">{t('nav.planningEasier')}</p>
            <div className="mega__tile-grid">
              <Link href="/dugun-mekani" className="mega__promo mega__promo--rose">
                <ClipboardList size={28} strokeWidth={1.5} aria-hidden="true" />
                <span>{t('nav.promoQuote')}</span>
              </Link>
              <Link href="/favorites" className="mega__promo mega__promo--sand">
                <Heart size={28} strokeWidth={1.5} aria-hidden="true" />
                <span>{t('nav.promoFavorites')}</span>
              </Link>
              <Link href="/blog" className="mega__promo mega__promo--ink">
                <Sparkles size={28} strokeWidth={1.5} aria-hidden="true" />
                <span>{t('nav.promoGuide')}</span>
              </Link>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'wedding',
      label: t('nav.weddingEngagement'),
      href: '/dugun-mekani',
      panel: (
        <>
          {shortcuts}
          <div className="mega__columns">
            {chunk(WEDDING_CATEGORIES, 4).map((column, i) => (
              <ul key={i} className="mega__column">
                {column.map(categoryLink)}
              </ul>
            ))}
          </div>
          {tiles(t('nav.buildTeam'), teamTiles.wedding)}
        </>
      ),
    },
    {
      id: 'special',
      label: t('nav.specialDays'),
      href: '/sunnet-organizasyonu',
      panel: (
        <>
          {shortcuts}
          <div className="mega__columns">
            <div className="mega__column">
              <p className="mega__col-title">{t('nav.events')}</p>
              <ul>{SPECIAL_DAY_CATEGORIES.map(categoryLink)}</ul>
            </div>
            <div className="mega__column">
              <p className="mega__col-title">{t('nav.services')}</p>
              <ul>{SPECIAL_DAY_SERVICES.map(categoryLink)}</ul>
            </div>
          </div>
          {tiles(t('nav.buildTeam'), teamTiles.special)}
        </>
      ),
    },
    {
      id: 'business',
      label: t('nav.forBusinesses'),
      href: null,
      panel: (
        <div className="mega__business">
          <p className="mega__business-text">{t('nav.businessPitch')}</p>
          <div className="mega__business-actions">
            <a href={`${panelUrl}/register`} className="ui-button ui-button--primary">
              {t('nav.addBusiness')}
            </a>
            <a href={`${panelUrl}/login`} className="ui-button ui-button--secondary">
              {t('nav.businessLogin')}
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <nav className="main-nav" ref={navRef} aria-label={t('nav.menu')} onMouseLeave={() => schedule(null, CLOSE_DELAY)}>
      <ul className="main-nav__list">
        {menus.map((menu) => {
          const open = openId === menu.id;
          return (
            <li key={menu.id} onMouseEnter={() => schedule(menu.id, OPEN_DELAY)}>
              <button
                type="button"
                className={`main-nav__item${open ? ' is-open' : ''}`}
                aria-expanded={open}
                aria-controls={`mega-${menu.id}`}
                onClick={() => setOpenId(open ? null : menu.id)}
              >
                {menu.label}
              </button>
              {open && (
                <div id={`mega-${menu.id}`} className="mega" onMouseEnter={() => schedule(menu.id, 0)}>
                  <div className="container mega__inner">
                    {menu.href && (
                      <Link href={menu.href} className="mega__title">
                        {menu.label}
                        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                      </Link>
                    )}
                    <div className="mega__body">{menu.panel}</div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        <li>
          <Link href="/blog" className="main-nav__item">
            {t('nav.guide')}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
