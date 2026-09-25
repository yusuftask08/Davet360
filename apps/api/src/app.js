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
  // Yüklenen görseller herkese açık ve panel/admin gibi başka origin'lerden <img> ile
  // gösteriliyor — helmet'in varsayılan CORP: same-origin başlığı bunları tarayıcıda
  // engelliyordu. Sadece bu statik klasör için cross-origin'e izin verilir.
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(env.uploadDir),
  );

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
