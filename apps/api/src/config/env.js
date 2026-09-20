import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/pazaryeri',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  altchaSecret: process.env.ALTCHA_SECRET ?? 'dev-altcha-secret-change-me',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001').split(
    ',',
  ),
  webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  panelUrl: process.env.PANEL_URL ?? 'http://localhost:3001',
  contactEmail: process.env.CONTACT_EMAIL ?? '',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'Davet360 <no-reply@davet360.com>',
  },
};
