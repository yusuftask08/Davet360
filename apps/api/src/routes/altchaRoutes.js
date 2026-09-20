import { Router } from 'express';
import { createChallenge } from 'altcha-lib/v1';
import { env } from '../config/env.js';

export const altchaRouter = Router();

// Public, anonim yazılabilen formların (kayıt, teklif) önüne konan proof-of-work bulmacası.
// Üçüncü parti servis yok — tamamen kendi sunucumuzda üretilip doğrulanıyor.
altchaRouter.get('/challenge', async (_req, res, next) => {
  try {
    const challenge = await createChallenge({ hmacKey: env.altchaSecret, maxNumber: 100000 });
    res.json(challenge);
  } catch (err) {
    next(err);
  }
});
