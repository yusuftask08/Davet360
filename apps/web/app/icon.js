import { ImageResponse } from 'next/og';

// icon.svg (public/) modern tarayıcılarda favicon olarak kullanılır ama Safari SVG favicon'u
// desteklemiyor — bu dosya Next.js'in dosya tabanlı favicon üretimiyle aynı tasarımın PNG
// fallback'ini otomatik üretir (harici görsel aracı gerekmez). Renk/harf public/icon.svg ile birebir.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 7,
          color: '#FBF7F2',
          fontSize: 22,
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
