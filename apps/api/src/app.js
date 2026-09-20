import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(mongoSanitize());
  app.use('/uploads', express.static(env.uploadDir));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
