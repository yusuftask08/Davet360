import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  // Coolify/Traefik reverse proxy arkasında — gerçek istemci IP'si X-Forwarded-For'dan okunsun,
  // yoksa rate limiter tüm kullanıcıları proxy'nin tek IP'si sayar.
  app.set('trust proxy', 1);

  app.use(helmet());
  // credentials:true + spesifik origin listesi (env.corsOrigins) zorunlu — httpOnly cookie
  // tarayıcıdan cross-origin gönderilebilsin diye. Wildcard '*' ile credentials asla birlikte
  // kullanılamaz (tarayıcı reddeder), bu yüzden corsOrigins her zaman açık liste olmalı.
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use('/uploads', express.static(env.uploadDir));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
