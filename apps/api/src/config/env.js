import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4600),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/pazaryeri',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  // 15 gün — kullanıcı her gün/her birkaç saatte bir tekrar login olmak zorunda kalmasın diye.
  // Tek kaynak (gün sayısı) hem jsonwebtoken'ın "15d" formatına hem cookie maxAge'in ms'ine
  // buradan türetilir — ikisi farklı yerlerde ayrı ayrı güncellenip birbirinden sapmasın diye.
  jwtExpiresInDays: Number(process.env.JWT_EXPIRES_IN_DAYS ?? 15),
  get jwtExpiresIn() {
    return `${this.jwtExpiresInDays}d`;
  },
  get jwtExpiresInMs() {
    return this.jwtExpiresInDays * 24 * 60 * 60 * 1000;
  },
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  altchaSecret: process.env.ALTCHA_SECRET ?? 'dev-altcha-secret-change-me',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3600,http://localhost:3601').split(
    ',',
  ),
  webUrl: process.env.WEB_URL ?? 'http://localhost:3600',
  panelUrl: process.env.PANEL_URL ?? 'http://localhost:3601',
  contactEmail: process.env.CONTACT_EMAIL ?? '',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'Davet360 <no-reply@davet360.com>',
  },
};
