import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin' },
});

export const leadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Çok fazla teklif talebi gönderildi, lütfen daha sonra tekrar deneyin' },
});

// Teklif yazışması — normal bir sohbeti engellemeyecek ama otomatik spam'i durduracak sınır.
export const messageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Çok fazla mesaj gönderildi, lütfen biraz sonra tekrar deneyin' },
});
