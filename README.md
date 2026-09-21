# Davet360

Düğün, nişan, orkestra/müzik, fotoğraf & video tedarikçilerini bir araya getiren pazaryeri. Detaylı ürün/mimari kararları için [docs/PROJECT.md](docs/PROJECT.md), veri modeli için [docs/specs/01-data-model.md](docs/specs/01-data-model.md).

## Monorepo yapısı
```
/apps
  /web     -> Next.js, müşteri tarafı (public, PWA, SEO, i18n: /tr + /en)
  /panel   -> Next.js, vendor + admin paneli (private, noindex, sadece TR)
  /api     -> Express API + MongoDB (Mongoose)
/packages
  /ui           -> tasarım sistemi (token'lar + bileşenler, AltchaWidget dahil)
  /constants    -> kategori/rol/status enum'ları
  /utils        -> zod validasyon şemaları + yardımcılar
  /api-client   -> web/panel'in ortak API client'ı
  /config       -> ortak eslint/prettier tabanı
/scripts
  backup.sh     -> Mongo + upload klasörü yedekleme
```

## Kurulum
```bash
pnpm install
cp .env.example .env          # apps/api bu dosyayı okur, ALTCHA_SECRET'ı prod'da değiştirin
docker compose up -d          # local MongoDB + (opsiyonel) Umami analytics
```

## Geliştirme
```bash
pnpm dev
```
- API: http://localhost:4600/api/health
- Web: http://localhost:3600 (otomatik `/tr`'a yönlenir, `/en` de mevcut)
- Panel: http://localhost:3601
- Umami (analytics dashboard, ilk kurulumda hesap oluşturmanız gerekir): http://localhost:3002

Production'da MongoDB + Umami Coolify/Hetzner üzerinde ayrı servisler olarak çalışır, `docker-compose.yml` sadece local geliştirme içindir.

## Yedekleme
```bash
bash scripts/backup.sh
```
Mongo container'ının kendi `mongodump`'ını kullanır (host'a ekstra araç kurmaya gerek yok), `./backups` klasörüne gzip'li archive + upload klasörünün tar'ı düşer, 30 günden eski yedekler otomatik silinir. Production'da crontab'a eklenir:
```
0 3 * * * cd /path/to/davet360 && bash scripts/backup.sh >> /var/log/davet360-backup.log 2>&1
```

## İlk admin kullanıcısını oluşturma
Şu an admin kaydı için ayrı bir endpoint yok (güvenlik gereği admin self-servis oluşturulamaz). İlk admini Mongo shell'den elle işaretleyin:
```js
db.users.updateOne({ email: "admin@davet360.com" }, { $set: { role: "admin" } })
```
(Önce `/api/auth/register` ile normal kullanıcı olarak kayıt olun, sonra rolünü yükseltin.)

## Yeni bir dil/metin eklerken
`apps/web/messages/tr.json` ve `en.json`'a aynı anahtarı eklemeden merge etmeyin — next-intl eksik anahtarda build'i kırmaz ama sessizce anahtarı gösterir, bu yüzden code review'da ikisinin de güncellendiği kontrol edilir.
