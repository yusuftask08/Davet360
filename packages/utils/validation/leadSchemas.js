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

export const leadMessageSchema = z.object({
  body: z.string().trim().min(1, 'Mesaj boş olamaz').max(2000, 'En fazla 2000 karakter'),
});

export const leadStatusSchema = z.object({
  status: z.enum(['contacted', 'booked', 'declined']),
});
