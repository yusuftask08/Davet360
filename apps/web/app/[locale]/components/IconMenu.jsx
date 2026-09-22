'use client';

import { useEffect, useRef, useState } from 'react';

// Navbar'daki ikon tetikleyicili açılır menülerin (hamburger/dil — SettingsMenu, hesap —
// AuthNav) ortak iskeleti: aç/kapa state'i + dışarı tıklayınca kapatma. İki yerde ayrı ayrı
// yazılmasın diye buradan paylaşılır. children bir fonksiyonsa `close()` alır (link/logout
// tıklanınca menüyü kapatmak için).
export function IconMenu({ icon, label, avatar = false, children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="site-navbar__icon-menu" ref={rootRef}>
      <button
        type="button"
        className={`site-navbar__icon-trigger${avatar ? ' site-navbar__icon-trigger--avatar' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
      >
        {icon}
      </button>
      {open && (
        <div className="site-navbar__icon-panel" role="menu">
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}
