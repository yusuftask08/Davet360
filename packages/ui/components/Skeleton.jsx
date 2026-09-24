// Yüklenme sırasında içeriğin yerini tutan gri blok. Spinner'dan farkı: sayfanın nihai
// düzenini taklit ettiği için içerik gelince layout zıplamaz (CLS) ve kullanıcı ne
// geleceğini görür. aria-hidden — ekran okuyucuya "yükleniyor" bilgisini sarmalayan
// loading.js'teki tek bir canlı bölge (role="status") verir, her blok ayrı ayrı değil.
export function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-md)', className, style }) {
  return (
    <span
      aria-hidden="true"
      className={className ? `ui-skeleton ${className}` : 'ui-skeleton'}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

// VendorCard'ın birebir iskelet karşılığı — kart ızgaralarında (kategori/şehir listeleri,
// anasayfa satırları) yüklenirken aynı boyutu kaplar.
export function VendorCardSkeleton() {
  return (
    <div className="ui-vendor-card">
      <Skeleton height="auto" radius="var(--radius-lg)" className="ui-skeleton--card-media" />
      <div className="ui-vendor-card__body">
        <Skeleton width="70%" height={15} />
        <Skeleton width="45%" height={13} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}
