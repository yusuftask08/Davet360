import { z } from 'zod';
import { phoneSchema } from './phone.js';

export const createLeadSchema = z.object({
  vendorId: z.string().min(1),
  customerName: z.string().min(2, 'En az 2 karakter olmalı').max(100),
  customerPhone: phoneSchema(),
  customerEmail: z.string().email('Geçerli bir email girin').optional(),
  eventDate: z.coerce.date().optional(),
  message: z.string().max(1000).optional(),
});
