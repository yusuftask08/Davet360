import { Router } from 'express';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '@repo/utils';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiters.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAltcha } from '../middleware/altcha.js';
import { env } from '../config/env.js';
import {
  registerCustomer,
  login,
  toSafeUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  changePassword,
} from '../services/authService.js';
import { User } from '../models/index.js';

export const authRouter = Router();

// Web tarayıcısı bu cookie'yi otomatik gönderir, JS'ten hiç erişilemez (XSS'te token
// çalınamaz). sameSite:'none' + secure gerekiyor çünkü web (3600) ve api (4600) farklı
// origin — prod'da da alt domain farklı olacağı için cross-site sayılır. Mobil (React
// Native) bu cookie'yi kullanmaz, login body'sindeki ham token'ı kendi güvenli deposunda
// tutup Authorization header ile gönderir; requireAuth ikisini de kabul eder.
function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: env.jwtExpiresInMs,
    path: '/',
  };
}

authRouter.post(
  '/register',
  authRateLimiter,
  requireAltcha,
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const user = await registerCustomer(req.body);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post('/login', authRateLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.cookie('token', result.token, cookieOptions());
    // token body'de de dönülür — web onu artık kullanmıyor (cookie yeterli), ama mobil
    // istemci (React Native) buradan alıp kendi güvenli deposunda saklar.
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', { ...cookieOptions(), maxAge: undefined });
  res.json({ message: 'Çıkış yapıldı' });
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    res.json({ user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  requireAltcha,
  validateBody(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      await requestPasswordReset(req.body.email);
      // Email kayıtlı olsa da olmasa da aynı cevap — enumeration'a izin verilmez.
      res.json({ message: 'Email adresiniz sistemde kayıtlıysa şifre sıfırlama linki gönderildi.' });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  async (req, res, next) => {
    try {
      await resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Şifreniz güncellendi.' });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.put('/me', requireAuth, validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await updateProfile(req.user.sub, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

authRouter.post(
  '/change-password',
  requireAuth,
  authRateLimiter,
  validateBody(changePasswordSchema),
  async (req, res, next) => {
    try {
      await changePassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
      res.json({ message: 'Şifreniz güncellendi.' });
    } catch (err) {
      next(err);
    }
  },
);
