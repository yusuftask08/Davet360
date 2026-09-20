import { z } from 'zod';
import { CATEGORY_SLUGS } from '@repo/constants';

export const createBlogPostSchema = z.object({
  title: z.string().min(3, 'En az 3 karakter olmalı').max(200),
  content: z.string().min(50, 'En az 50 karakter olmalı'),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  relatedCategory: z.enum(CATEGORY_SLUGS).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  publish: z.boolean().optional(),
});

// Admin bir yazıyı düzenlerken kullanılır — tüm alanlar opsiyonel.
export const updateBlogPostSchema = createBlogPostSchema.partial();
