import { Link } from '../../../i18n/navigation.js';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// items: [{ name, href }] — href locale-relative path ('' = ana sayfa). Hem görünen breadcrumb
// hem BreadcrumbList structured data tek yerden üretilir — iki yerde aynı veri tekrar yazılmaz.
export function Breadcrumb({ locale, items }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginBottom: 'var(--space-md)' }}
      >
        {items.map((item, index) => (
          <span key={item.href}>
            {index > 0 && ' / '}
            {index === items.length - 1 ? item.name : <Link href={item.href || '/'}>{item.name}</Link>}
          </span>
        ))}
      </nav>
    </>
  );
}
