import { Router } from 'express';
import { createLeadSchema, leadMessageSchema, leadStatusSchema } from '@repo/utils';
import { validateBody } from '../middleware/validate.js';
import { leadRateLimiter, messageRateLimiter } from '../middleware/rateLimiters.js';
import { requireAltcha } from '../middleware/altcha.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createLead,
  listLeadsForCustomer,
  getLeadForUser,
  addLeadMessage,
  updateLeadStatus,
} from '../services/leadService.js';

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

// Teklif detayı + yazışma. Erişim: teklifin müşterisi, işletme sahibi veya admin (servis
// katmanında kontrol edilir).
leadRouter.get('/:leadId', requireAuth, async (req, res, next) => {
  try {
    const lead = await getLeadForUser(req.params.leadId, req.user);
    res.json({ lead });
  } catch (err) {
    next(err);
  }
});

leadRouter.post(
  '/:leadId/messages',
  messageRateLimiter,
  requireAuth,
  validateBody(leadMessageSchema),
  async (req, res, next) => {
    try {
      const lead = await addLeadMessage(req.params.leadId, req.user, req.body.body);
      res.status(201).json({ lead });
    } catch (err) {
      next(err);
    }
  },
);

leadRouter.patch('/:leadId/status', requireAuth, validateBody(leadStatusSchema), async (req, res, next) => {
  try {
    const lead = await updateLeadStatus(req.params.leadId, req.user, req.body.status);
    res.json({ lead });
  } catch (err) {
    next(err);
  }
});
