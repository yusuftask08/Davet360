import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API ${env.port} portunda çalışıyor`);
  });
}

main().catch((err) => {
  console.error('Sunucu başlatılamadı', err);
  process.exit(1);
});
