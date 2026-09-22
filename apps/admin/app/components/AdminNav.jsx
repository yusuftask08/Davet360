'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Genel Bakış' },
  { href: '/vendors', label: 'Vendor’lar' },
  { href: '/reviews', label: 'Yorumlar' },
  { href: '/blog', label: 'Blog' },
  { href: '/users', label: 'Kullanıcılar' },
  { href: '/leads', label: 'Teklif Talepleri' },
  { href: '/audit-log', label: 'İşlem Geçmişi' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: 'flex',
        gap: 'var(--space-md)',
        overflowX: 'auto',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-lg)',
        paddingBottom: 'var(--space-sm)',
      }}
    >
      {LINKS.map((link) => {
        const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              whiteSpace: 'nowrap',
              fontSize: 'var(--font-size-sm)',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--color-primary)' : 'var(--color-neutral-700)',
              textDecoration: 'none',
              paddingBottom: 6,
              borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
