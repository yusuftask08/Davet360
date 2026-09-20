import { Router } from 'express';
import { createReviewSchema } from '@repo/utils';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createReview, listApprovedReviews, listMyReviews } from '../services/reviewService.js';

export const reviewRouter = Router();

// Tek segment'li route'lar '/:vendorId' ile çakışmasın diye ondan ÖNCE tanımlanır.
reviewRouter.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const items = await listMyReviews(req.user.sub);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

reviewRouter.get('/:vendorId', async (req, res, next) => {
  try {
    const items = await listApprovedReviews(req.params.vendorId);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

reviewRouter.post('/', requireAuth, validateBody(createReviewSchema), async (req, res, next) => {
  try {
    const review = await createReview(req.user.sub, req.body);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});
