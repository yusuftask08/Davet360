import { Router } from 'express';
import { listPublishedPosts, getPublishedPostBySlug } from '../services/blogService.js';

export const blogRouter = Router();

blogRouter.get('/', async (_req, res, next) => {
  try {
    const items = await listPublishedPosts();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

blogRouter.get('/:slug', async (req, res, next) => {
  try {
    const post = await getPublishedPostBySlug(req.params.slug);
    res.json({ post });
  } catch (err) {
    next(err);
  }
});
