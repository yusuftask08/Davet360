'use client';

import { useEffect, useRef, useState } from 'react';

// Navbar'daki ikon tetikleyicili açılır menülerin (hamburger/dil — SettingsMenu, hesap —
// AuthNav) ortak iskeleti: aç/kapa state'i + dışarı tıklayınca kapatma. İki yerde ayrı ayrı
// yazılmasın diye buradan paylaşılır. children bir fonksiyonsa `close()` alır (link/logout
// tıklanınca menüyü kapatmak için).
export function IconMenu({ icon, label, avatar = false, children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  function close() {
    setOpen(false);
    // Panel kapanınca odak kaybolmasın diye tetikleyici butona geri döner — klavye
    // kullanıcısı Escape'e bastığında sayfanın başına atılmaz.
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="site-navbar__icon-menu" ref={rootRef}>
      <button
        ref={triggerRef}
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
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
