import { z } from 'zod';

export const createReviewSchema = z.object({
  vendorId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});
