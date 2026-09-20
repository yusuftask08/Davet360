import Image from 'next/image';
import { Badge } from './Badge.jsx';

function formatPriceRange(priceRange) {
  if (!priceRange?.min && !priceRange?.max) return null;
  const format = (n) => new Intl.NumberFormat('tr-TR').format(n);
  if (priceRange.min && priceRange.max) return `${format(priceRange.min)} - ${format(priceRange.max)} ₺`;
  return `${format(priceRange.min ?? priceRange.max)}₺'den itibaren`;
}

// href verilirse <a>, verilmezse <div> olarak render eder — Next.js Link ile sarmalamak
// isteyen sayfalar bileşeni doğrudan Link içine de koyabilir.
// verifiedLabel çağıran sayfadan gelir (t('vendor.verified')) — paylaşılan bileşen kendi
// başına next-intl'e erişemez, bu yüzden metni hardcode etmek yerine prop olarak alır.
export function VendorCard({ vendor, categoryLabel, href, verifiedLabel = '✓ Davet360 Onaylı', as: As = 'a', ...props }) {
  const initial = vendor.businessName?.charAt(0)?.toUpperCase() ?? '?';
  const priceLabel = formatPriceRange(vendor.priceRange);

  return (
    <As href={href} className="ui-vendor-card" {...props}>
      <div className="ui-vendor-card__media">
        {vendor.images?.[0] ? (
          <Image
            src={vendor.images[0]}
            alt={vendor.businessName}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="ui-vendor-card__body">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {categoryLabel && <Badge variant="accent">{categoryLabel}</Badge>}
          {/* Bu bileşene ulaşan her vendor zaten backend'de onaylı filtresinden geçmiştir. */}
          <Badge variant="success">{verifiedLabel}</Badge>
        </div>
        <h3 className="ui-vendor-card__title">{vendor.businessName}</h3>
        <p className="ui-vendor-card__meta">{vendor.city}</p>
        {priceLabel && <p className="ui-vendor-card__meta">{priceLabel}</p>}
        {vendor.reviewCount > 0 && (
          <Badge>
            {vendor.avgRating.toFixed(1)} ★ ({vendor.reviewCount})
          </Badge>
        )}
      </div>
    </As>
  );
}
