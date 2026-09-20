import { z } from 'zod';
import { CATEGORY_SLUGS } from '@repo/constants';
import { phoneSchema } from './phone.js';

export const createVendorSchema = z.object({
  businessName: z.string().min(2, 'En az 2 karakter olmalı').max(150),
  category: z.enum(CATEGORY_SLUGS, { errorMap: () => ({ message: 'Geçerli bir kategori seçin' }) }),
  description: z.string().min(20, 'En az 20 karakter olmalı').max(3000),
  city: z.string().min(2, 'En az 2 karakter olmalı').max(100),
  phone: phoneSchema(),
  whatsapp: phoneSchema({ optional: true }),
  email: z.string().email('Geçerli bir email girin').optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  priceRange: z
    .object({ min: z.number().nonnegative(), max: z.number().nonnegative() })
    .refine((data) => data.min <= data.max, {
      message: 'Min. fiyat max. fiyattan büyük olamaz',
      path: ['max'],
    })
    .optional(),
  capacity: z.number().int().positive('Pozitif bir sayı olmalı').optional(),
  images: z.array(z.string()).max(10, 'En fazla 10 görsel yükleyebilirsiniz').optional(),
});

// Vendor kendi ilanını düzenlerken / admin bir ilanı düzenlerken kullanılır — tüm alanlar
// opsiyonel, sadece gönderilen alanlar güncellenir. Aynı kural (regex, uzunluk vs.) tekrar
// yazılmaz, createVendorSchema'nın üstüne inşa edilir.
export const updateVendorSchema = createVendorSchema.partial();
