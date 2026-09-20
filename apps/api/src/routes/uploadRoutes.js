import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new ApiError(400, 'Sadece jpg, png veya webp yükleyebilirsiniz'));
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

// Güvenlik: mime whitelist + boyut limiti + rastgele dosya adı (path traversal önlenir)
// + sharp ile yeniden encode (orijinal dosya asla diske yazılmaz).
uploadRouter.post('/image', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'Dosya bulunamadı');

    await fs.mkdir(env.uploadDir, { recursive: true });
    const filename = `${crypto.randomUUID()}.webp`;
    const filepath = path.join(env.uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(filepath);

    res.status(201).json({ path: `/uploads/${filename}` });
  } catch (err) {
    next(err);
  }
});
