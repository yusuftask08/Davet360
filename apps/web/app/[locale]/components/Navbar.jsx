import { getTranslations } from 'next-intl/server';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { Heart, MessageCircle, Search } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';
import { AuthNav } from './AuthNav.jsx';
import { MainNav } from './MainNav.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { SPECIAL_DAY_CATEGORIES, SPECIAL_DAY_SERVICES, WEDDING_CATEGORIES } from '../lib/navGroups.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

const DEFAULT_TILES = {
  wedding: ['dugun-mekani', 'fotograf-video', 'gelinlik-damatlik'],
  special: ['sunnet-organizasyonu', 'dogum-gunu-organizasyonu', 'pasta-tatli'],
};

// Mega menüdeki "Ekibini kur" kartları: öne çıkan işletmelerin fotoğrafları, kategori adıyla.
// Her kategoriden en fazla bir kart; görselli işletme yetmezse ikonlu kategori kartıyla tamamlanır.
function buildTiles(vendors, allowed, defaults, t) {
  const tiles = [];
  const used = new Set();
  for (const vendor of vendors) {
    if (tiles.length === 3) break;
    if (!allowed.includes(vendor.category) || used.has(vendor.category) || !vendor.images?.[0]) continue;
    used.add(vendor.category);
    tiles.push({
      slug: vendor.category,
      href: `/${vendor.category}`,
      image: apiClient.assetUrl(vendor.images[0]),
      label: t(`categories.${vendor.category}`),
    });
  }
  for (const slug of defaults) {
    if (tiles.length === 3) break;
    if (used.has(slug)) continue;
    used.add(slug);
    tiles.push({ slug, href: `/${slug}`, image: null, label: t(`categories.${slug}`) });
  }
  return tiles;
}

// The Knot düzeni: masaüstünde üst satırda logo + sağda arama/favori/mesaj/hesap, altında
// mega menülü gezinme satırı. Mobilde tek satır: hamburger çekmecesi, ortada logo, arama.
export async function Navbar() {
  const t = await getTranslations();
  const panelUrl = process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3001';

  const featured = await apiClient.get(`${ENDPOINTS.vendorFeatured}?limit=24`).catch(() => ({ items: [] }));
  const teamTiles = {
    wedding: buildTiles(featured.items, WEDDING_CATEGORIES, DEFAULT_TILES.wedding, t),
    special: buildTiles(featured.items, [...SPECIAL_DAY_CATEGORIES, ...SPECIAL_DAY_SERVICES], DEFAULT_TILES.special, t),
  };

  return (
    <header className="site-header">
      <div className="container site-header__top">
        <div className="site-header__mobile">
          <MobileMenu panelUrl={panelUrl} />
        </div>
        <Link href="/" className="site-navbar__logo site-header__logo">
          Merasim<span>360</span>
        </Link>
        <div className="site-header__actions">
          <Link href="/search" className="site-header__icon" aria-label={t('nav.search')}>
            <Search size={22} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link href="/favorites" className="site-header__icon site-header__desktop" aria-label={t('nav.favorites')}>
            <Heart size={22} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link href="/account" className="site-header__icon site-header__desktop" aria-label={t('nav.messages')}>
            <MessageCircle size={22} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <span className="site-header__desktop">
            <AuthNav />
          </span>
        </div>
      </div>
      <div className="site-header__nav">
        <div className="container">
          <MainNav teamTiles={teamTiles} panelUrl={panelUrl} />
        </div>
      </div>
    </header>
  );
}
