'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Genel Bakış' },
  { href: '/admin/vendors', label: 'Vendor’lar' },
  { href: '/admin/reviews', label: 'Yorumlar' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/users', label: 'Kullanıcılar' },
  { href: '/admin/leads', label: 'Teklif Talepleri' },
  { href: '/admin/audit-log', label: 'İşlem Geçmişi' },
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
        const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
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
