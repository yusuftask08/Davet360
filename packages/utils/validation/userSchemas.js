import { z } from 'zod';
import { ROLE_LIST } from '@repo/constants';

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(ROLE_LIST).optional(),
});
