import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

// Token iki kaynaktan gelebilir: httpOnly "token" cookie'si (web — tarayıcı otomatik gönderir,
// JS token'a hiç erişemez, XSS'te çalınamaz) veya Authorization: Bearer header (React Native /
// üçüncü parti API istemcileri — mobilde httpOnly cookie kavramı yok, token güvenli depoda
// tutulup header ile gönderilir). Cookie önce denenir, yoksa header'a bakılır.
function extractToken(req) {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);
  return null;
}

export function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) {
    return next(new ApiError(401, 'Giriş yapmanız gerekiyor'));
  }

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
  const token = extractToken(req);
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret);
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
