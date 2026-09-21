import { Router } from 'express';
import { createLeadSchema } from '@repo/utils';
import { validateBody } from '../middleware/validate.js';
import { leadRateLimiter } from '../middleware/rateLimiters.js';
import { requireAltcha } from '../middleware/altcha.js';
import { requireAuth } from '../middleware/auth.js';
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
  requireAuth,
  requireAltcha,
  validateBody(createLeadSchema),
  async (req, res, next) => {
    try {
      const lead = await createLead({ ...req.body, customerUserId: req.user.sub });
      res.status(201).json({ lead });
    } catch (err) {
      next(err);
    }
  },
);
