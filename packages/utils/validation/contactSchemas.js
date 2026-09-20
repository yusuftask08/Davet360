import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı').max(100),
  email: z.string().email('Geçerli bir email girin'),
  message: z.string().min(10, 'En az 10 karakter olmalı').max(2000),
});
