import { verifySolution } from 'altcha-lib/v1';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

// Public, anonim yazılabilen endpoint'lerde (kayıt, teklif) validateBody'den ÖNCE çalışır —
// altcha alanı domain şemasının parçası değil, doğrulandıktan sonra body'den silinir.
export async function requireAltcha(req, _res, next) {
  const payload = req.body?.altcha;
  if (!payload) {
    return next(new ApiError(400, 'Spam koruması doğrulaması eksik'));
  }

  try {
    const ok = await verifySolution(payload, env.altchaSecret);
    if (!ok) {
      return next(new ApiError(400, 'Spam koruması doğrulaması başarısız'));
    }
    delete req.body.altcha;
    next();
  } catch {
    next(new ApiError(400, 'Spam koruması doğrulaması başarısız'));
  }
}
