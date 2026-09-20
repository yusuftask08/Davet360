# Proje Özeti

**Davet360** — düğün, nişan, orkestra/müzik, fotoğraf & video gibi etkinlik tedarikçilerini bir araya getiren **pazaryeri (dizin + teklif alma)** platformu.

## Temel İlkeler (tavizsiz, her kararın üstünde durur)
1. **Sıfır ücretli paket/servis.** Supabase, Google Maps API, S3/R2, ücretli auth/analytics servisi vs. — hiçbiri yok. Her bileşen ücretsiz/açık kaynak olacak, yeni bir bağımlılık eklenmeden önce mutlaka kontrol edilecek.
2. **Tüm kod JavaScript.** TypeScript yok, tüm apps ve packages JS ile yazılır.
3. **Tamamen kendi altyapımız.** Kod, veritabanı (MongoDB), dosya depolama — hepsi kendi Coolify sunucumuzda. Üçüncü parti hosting/BaaS yok.
4. **Güvenlik açığı kesinlikle olmayacak.** Aşağıdaki "Güvenlik" bölümü opsiyonel değil, MVP'nin parçası.
5. **Yapı tamamen dönüşüme/reuse'a uygun olacak.** Yarın başka bir proje kurulmak istendiğinde minimum değişiklikle (sadece tema/token/kategori verisi değiştirerek) yeni bir `apps/*` açılabilmeli. Bkz. "Monorepo Yapısı" ve "Tasarım Sistemi".
6. **Responsive + PWA şart, opsiyonel değil.** Mobil öncelikli tasarım, ana ekrana eklenebilir PWA deneyimi.
7. **SEO mimariye gömülü, sonradan eklenen bir özellik değil.** Her sayfa, her route, her içerik tipi SEO kurallarına göre baştan tasarlanır (bkz. "SEO" bölümü).
8. **Vendor onay süreci admin kontrollü.** Serbest kayıt yok, kalite/güven admin onayından geçer.
9. **Kodda hata toleransı yok.** Test, lint ve CI kontrolünden geçmeyen kod merge edilmez (bkz. "Kod Kalitesi & Test").
10. **Her şey reusable yazılır.** Aynı mantık/bileşen iki kere yazılmaz (DRY); yeni bir özellik yazmadan önce `packages/*` içinde zaten var mı kontrol edilir.

## Kod Kalitesi & Test (hata toleransı yok)
- **Lint/format:** `packages/config`'teki ortak ESLint + Prettier kuralları tüm apps'te zorunlu, uyumsuz kod merge edilemez.
- **Test:** Kritik iş mantığı (auth, validasyon şemaları, filtreleme/arama, teklif formu) için Vitest ile unit test yazılır (ücretsiz). Her yeni fonksiyon/endpoint testsiz merge edilmez.
- **Merkezi hata yönetimi:** `apps/api`'de tek bir error-handling middleware — her endpoint kendi try/catch'ini rastgele yazmaz, tutarlı hata formatı (status code + mesaj) döner. Beklenmeyen hata asla stack trace olarak client'a sızmaz.
- **CI (GitHub Actions, ücretsiz):** Her PR'da otomatik lint + test + build çalışır; başarısız olursa merge edilemez.
- **Lighthouse CI (ücretsiz):** SEO ve performans skorları için eşik değer belirlenir, her PR'da otomatik kontrol edilir — SEO burada "sonradan bakarız" değil, merge'i bloklayan bir kalite kapısı.
- **Reusability kontrolü:** Code review checklist'ine "bu zaten `packages/ui` veya `packages/utils` içinde var mı?" sorusu eklenir — tekrar kod yazımı review'da yakalanır.

## Kapsam ve Ölçek
**Türkiye çapında** çalışan bir platform — tek bir şehre veya sadece düğüne özel değil, "davet edilebilecek her etkinlik" kapsanır:

- Düğün Mekanı, Düğün Organizasyonu, Nişan Organizasyonu, Kına Gecesi Organizasyonu
- Sünnet Organizasyonu, Doğum Günü / Yaş Günü Organizasyonu, Baby Shower Organizasyonu
- Mezuniyet Organizasyonu, Kurumsal Etkinlik Organizasyonu
- Orkestra / Müzik, Fotoğraf & Video, Catering & İkram, Pasta & Tatlı
- Dekorasyon & Balon, Davetiye & Kırtasiye, Gelinlik & Damatlık, Gelin Saçı & Makyaj
- Çocuk Animasyonu & Karakterler

(`packages/constants/categories.js` — yeni kategori eklemek tek satır, şema/route hiçbir yerde değişmez.)

**Şehir, sabit bir listeye bağlı değil.** Vendor kayıt olurken şehir adını serbest metin girer (`city`), sistem bunu otomatik normalize edip (`citySlug`, ör. "İstanbul" → "istanbul") SEO URL'i ve filtreleme için kullanır — Türkiye'nin 81 ili dahil her yerleşim yeri otomatik desteklenir, ayrıca bir şehir listesi bakımı gerekmez.

## İş Modeli
- **Sadece dizin + teklif alma.** Online ödeme / rezervasyon YOK (MVP kapsamı dışında).
- Müşteri bir vendor'ı bulur, profiline girer, teklif/mesaj formu doldurur.
- Vendor bu talebi görür, kendi iletişim kanalından (telefon/mail) döner.

## Roller
1. **Müşteri (ziyaretçi/kayıtlı kullanıcı)** — arama, filtreleme, vendor profili görüntüleme, teklif isteği gönderme. Giriş yaparsa `/account` sayfasından profilini düzenler, şifresini değiştirir, gönderdiği tüm teklif taleplerini ve yorumlarını görür (teklif formu giriş yapmış kullanıcıyı otomatik tanır — misafir gönderimi de çalışmaya devam eder).
2. **Vendor (tedarikçi)** — kayıt olur, profil/ilan oluşturur, admin onayından sonra yayına girer, gelen teklif taleplerini görür, ilanını (`/vendor/edit`) sonradan düzenleyebilir.
3. **Admin** — kapsamlı bir kontrol merkezinden (`apps/panel/app/admin`) yönetir:
   - **Vendor'lar** — tüm durumlar (bekleyen/onaylı/askıda/reddedilen) filtrelenip aranabilir, herhangi bir vendor'ın herhangi bir alanı düzenlenebilir, onaylı bir ilan sonradan yayından kaldırılıp (suspend) geri açılabilir (reactivate)
   - **Yorumlar** — bekleyen/onaylı/reddedilen filtreli liste, onaylanmış bir yorum da sonradan yayından kaldırılabilir
   - **Blog** — taslak+yayında tüm yazılar listelenir, düzenlenir, yayından kaldırılır
   - **Kullanıcılar** — arama, aktif/pasif etme, rol değiştirme (admin kendi rolünü değiştiremez — kilitli)
   - **Teklif talepleri** — tüm vendor'lardaki talepler tek ekrandan görülür
   - **İşlem geçmişi (audit log)** — hangi admin ne zaman ne yaptı, görüntülenebilir
   - **Dashboard** — durum bazlı vendor sayıları, toplam kullanıcı/talep/yorum/yazı istatistikleri

## Vendor Onay Süreci
- Serbest kayıt YOK. Vendor kayıt olur → başvuru "beklemede" statüsünde kalır → **admin onaylamadan ilan yayında görünmez.**
- Bu, platformun başlangıçta kalite/güven imajı oluşturması için tercih edildi.

## Ek Özellikler (MVP kapsamına dahil — hepsi implemente edildi)
- **Blog / Düğün Rehberi** ✅ — `apps/web/app/[locale]/blog`, admin `apps/panel/app/admin/blog/new`'den yazı yayınlar, kategoriye göre ilişkilendirilir, ilgili kategori sayfasına internal link verilir. `BlogPosting` structured data.
- **Yorum & puanlama sistemi** ✅ — Müşteri vendor sayfasından yorum bırakır (admin onayına düşer), admin panelden onaylar/reddeder, onaylanan yorum `Vendor.avgRating`/`reviewCount`'u otomatik günceller.
- **Favorilere ekleme** ✅ — Kayıtlı müşteri vendor sayfasından favoriye ekler/çıkarır, `/favorites` sayfasında listeler.
- **WhatsApp click-to-chat** ✅ — Vendor profilinde `wa.me` linki.
- **Leaflet harita** ✅ — Vendor konumu varsa (`react-leaflet` + OpenStreetMap tile, API key yok) vendor sayfasında gösterilir.
- **Altcha spam koruması** ✅ — Kayıt (`apps/web`, `apps/panel`) ve teklif formunda proof-of-work widget, `apps/api`de `altcha-lib` ile doğrulanır.
- **Umami analytics** ✅ — `docker-compose.yml`'de self-hosted servis, `NEXT_PUBLIC_UMAMI_URL`/`NEXT_PUBLIC_UMAMI_WEBSITE_ID` set edilirse `apps/web` layout'una tracking script otomatik eklenir.
- **Otomatik yedekleme** ✅ — `scripts/backup.sh`, Mongo container'ının kendi `mongodump`'ını kullanır (host'a ekstra araç kurmaya gerek yok), upload klasörünü de tar'lar, 30 günden eski yedekleri siler. Coolify/cron ile zamanlanır.

Veri modeli etkisi: `Review`, `BlogPost` koleksiyonları (favoriler `User.favorites` içine gömülü) — bkz. `specs/01-data-model.md`.

## Teknoloji Stack'i
Tamamen ücretsiz/açık kaynak bileşenlerle, kendi sunucumuzda (Coolify) barınacak şekilde kurulacak. Ücretli SaaS/BaaS paketi YOK.

| Katman | Seçim |
|---|---|
| Frontend | Next.js (JavaScript, App Router) |
| Backend | Ayrı Node.js / Express API sunucusu (Next.js'ten bağımsız, kendi deploy'u) |
| Repo yapısı | **Monorepo** — Turborepo + pnpm workspaces (ücretsiz, açık kaynak) |
| PWA | `apps/web` PWA destekli (manifest.json + service worker) — ana ekrana eklenebilir, ileride native mobil app'e geçişte API aynı kalır |
| Veritabanı | MongoDB — kendi Coolify sunucumuzda (Docker container), Atlas gibi ücretli managed servis değil |
| Auth | Kendi JWT sistemimiz (`apps/api` içinde) — bcrypt + jsonwebtoken, kendi Mongo'muzda kullanıcı tutulur. (İlk planda NextAuth düşünülmüştü ama ayrı Express API kararından sonra NextAuth'u ayrı bir backend'e bağlamak gereksiz karmaşıklık olurdu — bu yüzden JWT'ye geçildi.) Ücretli üçüncü parti auth servisi yok |
| i18n | next-intl (ücretsiz) — TR (varsayılan) + EN, `apps/web` için `/tr` ve `/en` route'ları, her sayfada hreflang alternate |
| Dosya Depolama | Vendor görselleri kendi sunucumuzun diskinde saklanacak (S3/R2 gibi ücretli servis yok) |
| Hosting | Hetzner VPS + Coolify (kendi sunucumuz — sunucu kirası dışında hiçbir yönetilen/BaaS servise ücret ödenmez) |
| Tasarım | Responsive (mobil + tablet + masaüstü), modern ve sade arayüz — detaylı tasarım kararları spec aşamasında netleşecek |
| Harita | Leaflet + OpenStreetMap (Google Maps DEĞİL — kullanım bazlı ücretlendiriyor) |
| Görsel işleme | sharp (self-hosted) — upload edilen fotoğrafları otomatik resize/sıkıştırma |
| Spam koruması | Altcha (açık kaynak, ücretsiz captcha alternatifi) — vendor kayıt ve teklif formlarında |
| Analytics | Umami (self-hosted, kendi Coolify sunucumuzda) |
| Email | Nodemailer + ücretsiz SMTP tier — şifre sıfırlama, vendor onay bildirimi, teklif bildirimi için gerekli temel altyapı |

> Not: Her şey ücretsiz/self-hosted bileşenlerle kurulacak. Yeni bir bağımlılık (paket, servis, kütüphane) eklenmeden önce ücretli olup olmadığı kontrol edilecek.

## Monorepo Yapısı
Turborepo + pnpm workspaces ile tek repo, 3 ayrı uygulama:

```
/apps
  /web       -> Next.js, müşteri tarafı (public marketplace). PWA destekli.
  /panel     -> Next.js, vendor paneli + admin paneli (role bazlı route koruması)
  /api       -> Node.js/Express, backend API (Mongo bağlantısı burada)
/packages
  /ui        -> Paylaşılan tasarım sistemi: token'lar + reusable bileşenler (bkz. aşağıda)
  /config    -> Ortak eslint/prettier/tailwind config
  /utils     -> Paylaşılan yardımcı fonksiyonlar (formatlayıcılar, validasyon şemaları)
  /api-client -> web ve panel'in apps/api'ye istek atarken kullandığı tek merkezi client (fetch wrapper, endpoint sabitleri)
  /constants -> Kategori listesi, şehir listesi, rol enum'ları gibi paylaşılan sabit veriler
```

**Kural: apps ince (thin), packages kalın (fat) olacak.** Sayfa/route dosyaları sadece packages'daki bileşenleri ve client'ı çağırır; iş mantığı, stil, validasyon hep packages içinde yaşar. Böylece yarın yeni bir proje açıldığında (`apps/yeni-proje`), `packages/ui`, `packages/utils`, `packages/config` doğrudan reuse edilir — sıfırdan yazılmaz, sadece token/tema değerleri değişir.

- `web` ve `panel` aynı API'yi (`apps/api`) tüketir, tek backend.
- `panel` içinde vendor ve admin aynı app'te ama farklı yetki seviyeleriyle ayrılır (ayrı proje açmaya gerek yok, gereksiz karmaşıklık).
- İleride native mobil app (React Native / Expo) geldiğinde sadece yeni bir `apps/mobile` eklenir, `apps/api` değişmeden kullanılır — bu yüzden API sözleşmesi (endpoint/response formatı) baştan temiz tasarlanmalı.
- İleride farklı bir sektör için ikinci bir pazaryeri kurulmak istenirse: yeni bir `apps/*` seti açılır, `packages/ui` + `packages/config` + `packages/utils` aynen taşınır, sadece `packages/ui/tokens` içindeki renk/font/logo değerleri ve `packages/constants` içindeki kategori listesi değişir.

## Tasarım Sistemi (packages/ui)
Tek kaynak (single source of truth) token sistemi — hiçbir bileşende hardcoded renk/spacing/font OLMAYACAK:

```
/packages/ui
  /tokens
    colors.js       -> marka renk paleti (primary, secondary, neutral, success, error, warning)
    spacing.js       -> 4px bazlı spacing scale (4, 8, 12, 16, 24, 32...)
    typography.js    -> font-family, font-size scale, font-weight
    radius.js        -> border-radius scale
    shadow.js        -> box-shadow scale
    theme.css        -> yukarıdakilerin CSS custom properties (--color-primary vs.) olarak export edildiği dosya
  /components
    Button, Input, Select, Card, Badge, Modal, Tabs, Table, Toast, Skeleton, EmptyState...
  index.js
```

- Bileşenler CSS custom properties (`var(--color-primary)` vs.) üzerinden stillenir → yeni proje açılınca sadece `theme.css` + `colors.js` değişir, bileşen kodu hiç değişmez.
- Responsive breakpoint'ler de token olarak tanımlanır (`--bp-sm`, `--bp-md`, `--bp-lg`) — hem web hem panel aynı kırılım noktalarını kullanır.
- Karanlık mod (dark mode) altyapısı token seviyesinde baştan bırakılır (ileride açılabilir, MVP'de zorunlu değil).
- **Uygulanan marka kimliği:** mürdüm→gül→altın gradyanı (`--gradient-hero`), sıcak kağıt/ivory arka plan (`--color-paper`), `Plus Jakarta Sans` (next/font ile self-hosted, ücretsiz) tipografi, pill-shaped butonlar, yumuşak gölge/elevation ölçeği, hover'da kart kaldırma animasyonu (`motion.js` token'ları) — "yeni nesil" hissi bilinçli olarak buradan geliyor, sonradan eklenmedi.
- `VendorCard` bileşeni (`packages/ui/components/VendorCard.jsx`) vendor listeleme/arama/favoriler gibi her yerde reuse edilir.

## PWA Gereksinimi
`apps/web` (ve mümkünse `apps/panel`) PWA olarak kurulacak:
- `manifest.json` (ana ekrana ekle, ikon, tema rengi)
- Service worker ile temel offline/cache desteği
- Mobilde "uygulama gibi" hissettirmesi, native app çıkana kadar köprü görevi görmesi hedefleniyor

## SEO (her sayfaya gömülü, sonradan eklenen bir katman değil)
SEO tek bir özellik değil — mimarinin her katmanına baştan işlenecek:

**Sayfa/route seviyesi**
- Tüm public sayfalar (`apps/web`) SSR/SSG ile render edilir — hiçbir vendor/kategori/blog sayfası client-only render edilmez.
- Her sayfa tipi için dinamik `<title>` ve `meta description` (Next.js Metadata API) — vendor adı, kategori, şehir bilgisiyle otomatik üretilir.
- Open Graph + Twitter Card meta etiketleri her vendor/blog sayfasında (paylaşımda görsel + başlık doğru çıkması için).
- Canonical URL her sayfada tanımlı, duplicate content'e karşı.
- **SEO dostu, gerçek (query param değil) URL hiyerarşisi** — üç seviye, her biri kendi indekslenen sayfası:
  - `/[kategori]` — Türkiye geneli, şehir seçim linkleri + tüm ülkeden vendor listesi (ör. `/dugun-mekani`)
  - `/[kategori]/[sehir]` — asıl "yerel arama" landing page'i, ör. `/dugun-mekani/istanbul`, `/sunnet-organizasyonu/ankara` — "ankara sünnet organizasyonu" gibi aramalar için optimize
  - `/[kategori]/[sehir]/[slug]` — vendor detay sayfası, ör. `/orkestra-muzik/ankara/ayse-orkestra`
  - `/blog/[slug]`
  - Vendor'ın kategori/şehir'i URL'deki ile eşleşmezse (yanlış path'ten erişim) 404 döner — duplicate content önlenir.
  - Şehir hem görünen ad (`city`, ör. "İstanbul") hem normalize slug (`citySlug`, ör. "istanbul") olarak tutulur; `/[kategori]/[sehir]` sadece o kategori+şehirde GERÇEKTEN onaylı vendor'ı olan kombinasyonlar için sitemap'e girer (thin/boş sayfa yok).

**Yapısal veri (structured data / schema.org)**
- Vendor sayfalarında `LocalBusiness` (+ kategoriye göre `EventVenue`, `MusicGroup` vs.)
- Yorumlar için `AggregateRating` + `Review`
- Blog yazılarında `Article`/`BlogPosting`
- Kategori sayfalarında `BreadcrumbList`
- Blog'da SSS varsa `FAQPage`

**Site geneli**
- `sitemap.xml` otomatik üretilir (`next-sitemap`, ücretsiz) — vendor, kategori, blog sayfaları dahil, admin onayından geçmemiş vendor'lar sitemap'e girmez.
- `robots.txt` — admin/panel route'ları crawl'dan hariç tutulur, public sayfalar açık.
- Tüm görsellerde açıklayıcı `alt` metni zorunlu (vendor galeri görselleri dahil).
- Semantic HTML (`h1`-`h6` hiyerarşisi, `nav`, `main`, `article`) her template'te zorunlu kural.
- Core Web Vitals (LCP/CLS/INP) — `next/image` tüm public görsellerde (vendor kartı, vendor detay banner, blog kapak) kullanılır: otomatik responsive `srcset`, lazy-loading, boyut önceden bilindiği için layout shift (CLS) olmaz. Sunucu tarafında `sharp` upload anında ayrıca sıkıştırır.
- `BreadcrumbList` structured data + görünen breadcrumb (kategori/şehir/blog derinliğine göre) — paylaşılan `Breadcrumb` bileşeninden tek yerden üretilir.
- Serbest metin arama: `/search?q=` sayfası + Navbar'daki arama kutusu, backend'deki Mongo text index'i kullanır.
- Kurumsal sayfalar: `/about`, `/contact` (Altcha korumalı, `POST /contact` ile email gönderir — SMTP yoksa konsola loglar), `/privacy` (KVKK'ya değinen gizlilik politikası), `/terms` (kullanım şartları). Hepsi TR/EN, footer'dan linkli. **Not: Bu sayfaların metni taslak niteliğindedir, gerçek yayın öncesi bir hukukçu tarafından gözden geçirilmesi önerilir.**
- Kategori sayfalarında SEO amaçlı tanıtım metni (`categoryIntros.*`) + vendor'ı olmayan kategori/şehirlerde boş ekran yerine "İşletmeni Ekle" CTA'sı (panel'e link).
- Blog yazılarından ilgili vendor/kategori sayfalarına, vendor sayfalarından ilgili blog yazılarına internal link ağı kurulur.

**Kural:** Yeni bir sayfa/route eklenirken SEO checklist'i (title/description, structured data, slug, sitemap kaydı) code review'un standart parçası olacak — sonradan "SEO ekleyelim" diye ayrı bir iş kalemi olmayacak.

## i18n (Türkçe + İngilizce)
`apps/web` (müşteri tarafı) **next-intl** ile TR (varsayılan) + EN destekliyor:
- Tüm public route'lar `/tr/...` ve `/en/...` altında (`app/[locale]/...`), `middleware.js` locale algılar/yönlendirir.
- Metinler `messages/tr.json` ve `messages/en.json`'da — kod içinde hardcoded Türkçe/İngilizce metin YOK, her yeni metin bu dosyalara eklenir.
- Kategori isimleri de çeviri dosyalarında (`categories.*`) — `packages/constants`'taki `label` alanı sadece varsayılan/fallback, gerçek gösterim metni locale'e göre `messages/*.json`'dan gelir.
- `sitemap.js` her URL için iki dilin de `hreflang` alternate'ini üretir.
- Navbar'da dil değiştirici (`LocaleSwitcher`) var.
- `apps/panel` (vendor/admin, internal/private araç) kapsam dışı bırakıldı — sadece Türkçe. Public olmadığı ve SEO'ya girmediği için i18n gerekliliği yok; istenirse aynı pattern'le sonradan eklenebilir.

## Hata Yönetimi (Frontend)
Kullanıcı hiçbir zaman ham hata/çökme ekranı görmemeli:
- Her Next.js app'te `error.js` (segment içi render hatası), `global-error.js` (root layout çökerse) ve `not-found.js` (404) — Next'in varsayılan hata ekranı yerine markaya uygun, anlaşılır Türkçe (web'de ayrıca İngilizce) mesaj gösterilir.
- `packages/api-client`'ın `request()` fonksiyonu network hatalarını (sunucu kapalı, internet yok) yakalayıp kullanıcı dostu bir `ApiError`'a çevirir — ham `TypeError: Failed to fetch` asla ekrana çıkmaz.
- Her form (login, register, vendor ilanı, teklif, yorum) hem alan bazlı hem genel hata mesajı gösterir; sessizce başarısız olan (hiçbir şey göstermeyen) buton/aksiyon YOK — bu code review'da kontrol edilir.
- Backend'de merkezi error handler (bkz. "Kod Kalitesi & Test") zaten stack trace sızdırmıyor; frontend bu garantiye güvenip kullanıcıya `err.message`'ı doğrudan gösterebilir.

## Kritik Ürün Kararı: Responsive
Platform **mobil öncelikli (mobile-first) responsive** olmak zorunda. Düğün/nişan araştırması büyük oranda mobilden yapılıyor — bu yüzden:
- Tüm sayfalar mobil, tablet, masaüstü kırılım noktalarında test edilecek.
- Vendor arama/filtreleme ve teklif formu mobilde özellikle akıcı olmalı.
- Admin paneli masaüstü öncelikli olabilir ama mobilde de kullanılabilir olmalı.

## Kullanıcı Akışları (Flow)

### 1. Müşteri Akışı
1. Ana sayfa → kategori seç (Düğün mekanı / Nişan / Orkestra / Fotoğraf-Video)
2. Şehir/bölge + filtre (fiyat aralığı, kapasite, tarz vs. — kategoriye göre değişir) ile arama
3. Sonuç listesi → vendor kartına tıkla → vendor profil sayfası (galeri, açıklama, hizmet detayları, puan/yorumlar, harita konumu)
4. Profilde: "Favorilere Ekle", "WhatsApp'tan Yaz" (wa.me linki), "Teklif Al" seçenekleri
5. "Teklif Al" formu doldur (isim, telefon, etkinlik tarihi, kısa not) → gönder
6. Onay ekranı: "Talebiniz vendor'a iletildi"
7. (Kayıtlı müşteri) Deneyimledikten sonra vendor'a puan + yorum bırakabilir

### 2. Vendor Akışı
1. Vendor kayıt sayfası → firma bilgileri, kategori, iletişim bilgileri gir
2. Kayıt sonrası durum: **"Onay Bekliyor"**
3. Admin onayladıktan sonra vendor paneline giriş yapabilir
4. Panelden: profil/galeri düzenleme, hizmet/paket bilgisi girme
5. Gelen teklif taleplerini panelden görme (liste + detay)

### 3. Admin Akışı
1. Admin paneline giriş
2. Bekleyen vendor başvuruları listesi → detay incele → onayla / reddet
3. Yayındaki vendor ilanlarını yönetme (gerekirse yayından kaldırma)
4. Genel istatistik (kaç vendor, kaç teklif talebi vs.) — ileri aşama

## Güvenlik (zorunlu, tavizsiz)
Kendi sunucumuzda barındığımız için güvenlik tamamen bizim sorumluluğumuzda — aşağıdakiler MVP'den itibaren zorunlu:

**Backend (apps/api)**
- `helmet` ile güvenli HTTP header'ları
- `cors` whitelist — sadece `web` ve `panel` domain'lerine izin, `*` yasak
- `express-rate-limit` — login, kayıt, teklif formu gibi endpoint'lerde brute-force/spam koruması
- `express-mongo-sanitize` — NoSQL injection önleme
- Tüm input'lar `zod`/`joi` ile şema validasyonundan geçer, hiçbir endpoint validasyonsuz veri kabul etmez
- Şifreler `bcrypt` ile hash'lenir (salt rounds ≥ 10), asla plaintext/log'a yazılmaz
- Rol bazlı yetkilendirme (RBAC) middleware — vendor/admin route'ları kesin izole

**Dosya Upload**
- Mime-type whitelist (sadece jpg/png/webp), dosya boyutu limiti
- Dosya adları sanitize edilir (path traversal önleme), orijinal isim asla direkt kullanılmaz
- Upload klasörü execute edilemeyecek şekilde yapılandırılır (statik dosya servisi olarak sunulur)

**Altyapı**
- HTTPS zorunlu — Coolify/Traefik üzerinden otomatik Let's Encrypt
- `.env` dosyaları asla repo'ya commit edilmez (`.gitignore`), secret'lar Coolify environment değişkeni olarak tutulur
- Bağımlılık güvenliği: `npm audit` + GitHub Dependabot (ücretsiz) düzenli taranır
- Admin işlemleri (onay/red, silme vs.) audit log olarak kayıt altına alınır

**Kod tarafı**
- XSS önleme: kullanıcıdan gelen hiçbir veri `dangerouslySetInnerHTML` ile render edilmez (tek istisna: JSON-LD structured data, ham HTML değil JSON gömülür, script türü `application/ld+json` olduğu için tarayıcı çalıştırmaz)
- Auth JWT tabanlı olduğu için (aşağıya bkz.) CSRF riski client-side'da cookie'ye değil `Authorization` header'ına dayanır — klasik CSRF saldırı vektörü (cookie otomatik gönderimi) baştan devre dışı
- Spec aşamasında her endpoint için OWASP Top 10 kontrol listesi gözden geçirilecek

**Şifre sıfırlama**
- `POST /auth/forgot-password` → rastgele token üretilir, sadece **hash'i** DB'ye yazılır (ham token asla saklanmaz), email ile gönderilir (`nodemailer`, SMTP tanımsızsa link dev modunda konsola loglanır — local'de SMTP şart değil)
- Email var/yok fark etmeksizin aynı cevap döner (enumeration saldırısı önlenir)
- Token tek kullanımlık, 1 saat geçerli, kullanılınca silinir

## Sonraki Adım
Bu döküman onaylandıktan sonra aşağıdaki spec dosyalarına bölünecek (her biri ayrı iş paketi):
- `specs/01-data-model.md` — MongoDB şemaları (User, Vendor, Category, LeadRequest, Review, Favorite, BlogPost vs.)
- `specs/02-auth.md` — JWT kurulumu, şifre sıfırlama akışı ve rol bazlı yetkilendirme
- `specs/03-api.md` — Express API endpoint listesi
- `specs/04-frontend-pages.md` — sayfa/ekran listesi ve responsive kırılım noktaları
- `specs/05-vendor-panel.md`
- `specs/06-admin-panel.md`
- `specs/07-seo.md` — sayfa bazlı metadata, structured data ve sitemap kuralları
- `specs/08-design-system.md` — packages/ui token'ları, bileşen listesi, tema geçiş kuralları
- `specs/09-testing-ci.md` — test stratejisi, CI pipeline, Lighthouse CI eşik değerleri
