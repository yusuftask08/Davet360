import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addFavorite, removeFavorite, listFavorites } from '../services/favoriteService.js';

export const userRouter = Router();
userRouter.use(requireAuth);

userRouter.get('/me/favorites', async (req, res, next) => {
  try {
    const items = await listFavorites(req.user.sub);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

userRouter.post('/me/favorites/:vendorId', async (req, res, next) => {
  try {
    await addFavorite(req.user.sub, req.params.vendorId);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

userRouter.delete('/me/favorites/:vendorId', async (req, res, next) => {
  try {
    await removeFavorite(req.user.sub, req.params.vendorId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
