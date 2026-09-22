import Image from 'next/image';
import { Check, Star } from 'lucide-react';

// href verilirse <a>, verilmezse <div> olarak render eder — Next.js Link ile sarmalamak
// isteyen sayfalar bileşeni doğrudan Link içine de koyabilir.
// verifiedLabel çağıran sayfadan gelir (t('vendor.verified')) — paylaşılan bileşen kendi
// başına next-intl'e erişemez, bu yüzden metni hardcode etmek yerine prop olarak alır.
// favorite: sağ üstteki kalp ikonu için slot — apiClient/localStorage'a ihtiyacı olduğundan
// (auth durumu, favori toggle isteği) bu paylaşılan pakette değil, çağıran app'te (apps/web)
// yaşayan bir client component olarak buradan geçirilir.
// Airbnb tarzı: kart çerçevesiz/gölgesiz, görsel öne çıkar; onay rozeti sol üstte, kalp sağ
// üstte overlay, başlık+puan aynı satırda, kategori/şehir altında. Fiyat kasıtlı olarak
// GÖSTERİLMEZ — teklif almak için işletmeyle iletişime geçmek gerekiyor, platformun temel akışı.
// Airbnb'deki "Misafirlerin favorisi" rozetine denk gelen koşullu etiket — sadece gerçekten
// yüksek puanlı VE yeterli yorumu olan işletmelerde gösterilir, her kartta çıkmaz.
const HIGHLY_RATED_MIN_RATING = 4.8;
const HIGHLY_RATED_MIN_REVIEWS = 5;

export function VendorCard({
  vendor,
  categoryLabel,
  href,
  // Paylaşılan bileşen next-intl'e erişemez — çağıran app çevrilmiş metni geçirmeli.
  // Varsayılanlar Türkçe'ye kilitlenmesin diye nötr İngilizce (her çağıran zaten geçiriyor,
  // bu sadece bir güvenlik ağı).
  verifiedLabel = 'Verified',
  highlyRatedLabel = 'Highly rated',
  favorite,
  priority = false,
  as: As = 'a',
  className,
  ...props
}) {
  const initial = vendor.businessName?.charAt(0)?.toUpperCase() ?? '?';
  const isHighlyRated =
    vendor.reviewCount >= HIGHLY_RATED_MIN_REVIEWS && vendor.avgRating >= HIGHLY_RATED_MIN_RATING;

  return (
    <As href={href} className={className ? `ui-vendor-card ${className}` : 'ui-vendor-card'} {...props}>
      <div className="ui-vendor-card__media">
        {vendor.images?.[0] ? (
          <Image
            src={vendor.images[0]}
            alt={vendor.businessName}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            style={{ objectFit: 'cover' }}
            priority={priority}
          />
        ) : (
          <span>{initial}</span>
        )}
        {isHighlyRated ? (
          <span className="ui-vendor-card__highlight">{highlyRatedLabel}</span>
        ) : (
          <span className="ui-vendor-card__verified" role="img" aria-label={verifiedLabel} title={verifiedLabel}>
            <Check size={13} strokeWidth={3} aria-hidden="true" />
          </span>
        )}
        {favorite && <div className="ui-vendor-card__favorite">{favorite}</div>}
      </div>
      <div className="ui-vendor-card__body">
        <div className="ui-vendor-card__row">
          <h3 className="ui-vendor-card__title">{vendor.businessName}</h3>
          {vendor.reviewCount > 0 && (
            <span className="ui-vendor-card__rating">
              <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              {vendor.avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="ui-vendor-card__meta">
          {vendor.city}
          {categoryLabel ? ` · ${categoryLabel}` : ''}
        </p>
      </div>
    </As>
  );
}
