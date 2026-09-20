import { Router } from 'express';
import { contactSchema } from '@repo/utils';
import { validateBody } from '../middleware/validate.js';
import { requireAltcha } from '../middleware/altcha.js';
import { leadRateLimiter } from '../middleware/rateLimiters.js';
import { sendContactMessage } from '../services/emailService.js';

export const contactRouter = Router();

contactRouter.post('/', leadRateLimiter, requireAltcha, validateBody(contactSchema), async (req, res, next) => {
  try {
    await sendContactMessage(req.body);
    res.json({ message: 'Mesajınız iletildi, teşekkürler.' });
  } catch (err) {
    next(err);
  }
});
