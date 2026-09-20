import { z } from 'zod';
import { phoneSchema } from './phone.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı').max(100),
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(8, 'En az 8 karakter olmalı').max(72),
  phone: phoneSchema({ optional: true }),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Geçersiz link'),
  password: z.string().min(8, 'En az 8 karakter olmalı').max(72),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı').max(100).optional(),
  phone: phoneSchema({ optional: true }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(8, 'En az 8 karakter olmalı').max(72),
});
