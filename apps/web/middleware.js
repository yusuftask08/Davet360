import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing.js';

export default createMiddleware(routing);

export const config = {
  // icon/apple-icon kök seviyede (app/icon.js, app/apple-icon.js) — uzantısız URL'de servis
  // edildikleri için ".*\..*" dışlaması onları yakalamıyor, ayrıca hariç tutulmaları gerekiyor
  // (yoksa next-intl bunları sayfa route'u sanıp /tr/icon'a yönlendirip 404 üretiyor).
  matcher: ['/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)'],
};
