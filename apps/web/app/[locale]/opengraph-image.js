import { ImageResponse } from 'next/og';

// Vendor detay ve blog sayfalarının kendi görseli var (openGraph.images override eder) —
// bu, onların dışındaki her sayfa (anasayfa, kategori, hakkımızda vb.) paylaşıldığında
// WhatsApp/sosyal medyada boş/çirkin bir önizleme yerine markalı bir kart göstersin diye.
// next/og ile server-side üretilir — harici bir görsel araca ihtiyaç duymaz.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #B8355F 0%, #D97D4A 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: 'white' }}>
          Davet<span style={{ color: '#FFE1C7' }}>360</span>
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.92)', marginTop: 24 }}>
          Türkiye genelinde doğru işletmeyi bulun
        </div>
      </div>
    ),
    { ...size },
  );
}
