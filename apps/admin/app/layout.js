import { Plus_Jakarta_Sans } from 'next/font/google';
import '@repo/ui/theme.css';
import '@repo/ui/styles.css';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Admin app tamamen private — arama motorları hariç tutulur.
export const metadata = {
  title: 'Merasim360 Admin',
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: '#B8355F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
