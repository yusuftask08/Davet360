import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Giriş yapmanız gerekiyor'));
  }

  const token = header.slice('Bearer '.length);
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    next(new ApiError(401, 'Oturum geçersiz veya süresi dolmuş'));
  }
}

// Anonim gönderime izin veren ama giriş yapılmışsa kim olduğunu bilmek isteyen uçlar için
// (ör. teklif formu — misafir de doldurabilir ama giriş yapmışsa talep hesabına bağlanır).
// Token yok/geçersizse hata FIRLATMAZ, sadece req.user boş kalır.
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    req.user = jwt.verify(header.slice('Bearer '.length), env.jwtSecret);
  } catch {
    // geçersiz/süresi dolmuş token — anonim olarak devam, hata verme
  }
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Bu işlem için yetkiniz yok'));
    }
    next();
  };
}
