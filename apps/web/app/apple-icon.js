import { ImageResponse } from 'next/og';

// iOS'ta "Ana Ekrana Ekle" yapıldığında kullanılır — bu olmadan iOS sayfanın bir ekran
// görüntüsünü kullanır, markalı ikon yerine dağınık bir görüntü çıkar.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7A2145 0%, #B8355F 55%, #D9A441 130%)',
          color: '#FBF7F2',
          fontSize: 96,
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        D
      </div>
    ),
    { ...size },
  );
}
