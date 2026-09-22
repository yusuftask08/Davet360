import { z } from 'zod';
import { CATEGORY_SLUGS, AMENITY_KEYS } from '@repo/constants';
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
  amenities: z.array(z.enum(AMENITY_KEYS)).optional(),
});

// Vendor kendi ilanını düzenlerken / admin bir ilanı düzenlerken kullanılır — tüm alanlar
// opsiyonel, sadece gönderilen alanlar güncellenir. Aynı kural (regex, uzunluk vs.) tekrar
// yazılmaz, createVendorSchema'nın üstüne inşa edilir.
export const updateVendorSchema = createVendorSchema.partial();

// GET ?query string'i her zaman string (veya boş string) gelir — sayısal alanlar bu yüzden
// önce boş string'i undefined'a çevirip SONRA coerce ediyor, aksi halde Number('') -> NaN
// validasyonu her zaman geçersiz kılar (kullanıcı filtreyi boş bırakınca hata almamalı).
const optionalPositiveNumber = (max) =>
  z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().nonnegative('Negatif olamaz').max(max, 'Çok büyük bir değer').optional(),
  );

// Kategori+şehir listeleme sayfasındaki filtre formunun ($vendors?...) tek doğrulama noktası —
// hem sayı/enum tipleri hem de üst sınırlar burada zorlanır, controller çıplak req.query
// kullanmaz. amenities sadece gerçek AMENITY_KEYS listesinden gelebilir (uydurma değer geçmez).
export const vendorListQuerySchema = z.object({
  category: z.enum(CATEGORY_SLUGS).optional(),
  citySlug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Geçersiz şehir')
    .optional(),
  search: z.string().trim().max(120).optional(),
  maxBudget: optionalPositiveNumber(1_000_000_000),
  minCapacity: optionalPositiveNumber(1_000_000),
  amenities: z
    .union([z.array(z.enum(AMENITY_KEYS)), z.enum(AMENITY_KEYS)])
    .optional()
    .transform((value) => (value === undefined ? undefined : Array.isArray(value) ? value : [value])),
  sort: z.enum(['default', 'rating', 'budget-asc', 'budget-desc']).optional(),
  page: optionalPositiveNumber(100_000),
  limit: optionalPositiveNumber(100),
});
