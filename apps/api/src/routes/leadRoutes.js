import { Router } from 'express';
import { createLeadSchema } from '@repo/utils';
import { validateBody } from '../middleware/validate.js';
import { leadRateLimiter } from '../middleware/rateLimiters.js';
import { requireAltcha } from '../middleware/altcha.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createLead, listLeadsForCustomer } from '../services/leadService.js';

export const leadRouter = Router();

// Tek segment'li route'lar '/:vendorId'lı diğer route'larla çakışmasın diye önce tanımlanır.
leadRouter.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const items = await listLeadsForCustomer(req.user.sub);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

leadRouter.post(
  '/',
  leadRateLimiter,
  requireAltcha,
  optionalAuth,
  validateBody(createLeadSchema),
  async (req, res, next) => {
    try {
      // Giriş yapmış kullanıcı teklif gönderirse talep hesabına bağlanır — misafir de gönderebilir.
      const data = req.user ? { ...req.body, customerUserId: req.user.sub } : req.body;
      const lead = await createLead(data);
      res.status(201).json({ lead });
    } catch (err) {
      next(err);
    }
  },
);
