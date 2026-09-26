# Spec 01 — Veri Modeli (MongoDB / Mongoose)

`apps/api` içinde Mongoose ile tanımlanır. Tüm şemalar JavaScript (TS yok). Ortak alanlar (`createdAt`, `updatedAt`) her şemada `{ timestamps: true }` ile otomatik gelir, ayrıca yazılmaz.

## Enum'lar (packages/constants içinde tutulur, hem api hem web/panel aynı listeyi kullanır)

```js
// packages/constants/roles.js
export const ROLES = ['customer', 'vendor', 'admin'];

// packages/constants/categories.js
export const CATEGORIES = [
  { slug: 'dugun-mekani', label: 'Düğün Mekanı' },
  { slug: 'nisan-organizasyonu', label: 'Nişan Organizasyonu' },
  { slug: 'orkestra-muzik', label: 'Orkestra / Müzik' },
  { slug: 'fotograf-video', label: 'Fotoğraf & Video' },
];

// packages/constants/vendor-status.js
export const VENDOR_STATUS = ['pending', 'approved', 'rejected', 'suspended'];

// packages/constants/lead-status.js
export const LEAD_STATUS = ['new', 'contacted', 'booked', 'declined', 'closed']; // 'closed' sadece eski kayıtlar için

// packages/constants/review-status.js
export const REVIEW_STATUS = ['pending', 'approved', 'rejected'];
```

Yeni kategori eklemek = sadece bu diziye eklemek. Şema değişmez.

---

## User
Müşteri, vendor sahibi ve admin — tek koleksiyon, `role` alanıyla ayrılır.

| Alan | Tip | Not |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | required |
| `email` | String | required, unique, lowercase, index |
| `passwordHash` | String | required — bcrypt, salt ≥ 10 |
| `phone` | String | optional |
| `role` | String enum `ROLES` | default `customer` |
| `vendorId` | ObjectId ref `Vendor` | sadece role=vendor ise dolu |
| `favorites` | [ObjectId ref `Vendor`] | sadece role=customer için anlamlı |
| `isActive` | Boolean | default true — admin suspend edebilir |

**Index:** `email` unique.

> NextAuth Mongo adapter kullanılırsa ek olarak standart `accounts`, `sessions`, `verification_tokens` koleksiyonları otomatik gelir — bu şemaya elle dokunulmaz.

---

## Vendor
| Alan | Tip | Not |
|---|---|---|
| `_id` | ObjectId | |
| `ownerId` | ObjectId ref `User` | vendor hesabının sahibi |
| `businessName` | String | required |
| `slug` | String | required, unique, index — vendor detay URL'inin son parçası |
| `category` | String enum `CATEGORIES.slug` | required, index |
| `description` | String | required |
| `city` | String | required, index — görünen ad, ör. "İstanbul" |
| `citySlug` | String | required, index — `slugify(city)` ile otomatik üretilir (ör. "istanbul"), `/[kategori]/[sehir]` SEO URL'i ve filtreleme bunun üzerinden çalışır |
| `location` | `{ type: 'Point', coordinates: [lng, lat] }` | GeoJSON, Leaflet harita için — `2dsphere` index |
| `phone` | String | required |
| `whatsapp` | String | optional — dolu ise profilde "WhatsApp'tan Yaz" butonu çıkar |
| `email` | String | optional |
| `images` | [String] | disk üzerindeki dosya path'leri, ilk eleman kapak görseli |
| `priceRange` | `{ min: Number, max: Number }` | opsiyonel, kategoriye göre anlamlı |
| `capacity` | Number | sadece düğün/nişan mekanı için anlamlı, diğerlerinde boş |
| `status` | String enum `VENDOR_STATUS` | default `pending` |
| `approvedBy` | ObjectId ref `User` (admin) | onaylayan admin |
| `approvedAt` | Date | |
| `avgRating` | Number | denormalize — Review eklendikçe otomatik güncellenir, her sorguda hesaplatmamak için |
| `reviewCount` | Number | denormalize |
| `seoTitle` | String | opsiyonel override, boşsa businessName+city'den otomatik üretilir |
| `seoDescription` | String | opsiyonel override |

**Index:** `slug` unique, `location` 2dsphere, `category + citySlug` composite (arama/filtreleme için), `{ businessName: 'text', description: 'text' }` text index (arama için).

**Not:** `status !== 'approved'` olan vendor hiçbir public sorguda (arama, sitemap, listing) dönmez — bu kural API katmanında tek bir yerde (repository/query helper) uygulanır, her endpoint'te tekrar yazılmaz (DRY kuralı).

---

## LeadRequest (teklif talebi)
| Alan | Tip | Not |
|---|---|---|
| `_id` | ObjectId | |
| `vendorId` | ObjectId ref `Vendor` | required, index |
| `customerUserId` | ObjectId ref `User` | opsiyonel — misafir olarak da teklif istenebilir |
| `customerName` | String | required |
| `customerPhone` | String | required |
| `customerEmail` | String | opsiyonel |
| `eventDate` | Date | opsiyonel |
| `message` | String | opsiyonel kısa not |
| `status` | String enum `LEAD_STATUS` | default `new`; vendor'ın ilk cevabı `contacted` yapar, vendor `contacted`/`booked`/`declined` seçebilir |
| `messages` | Array (gömülü) | `{ senderRole: 'customer'\|'vendor', senderUserId, body (max 2000), createdAt }` — teklif üzerindeki yazışma |
| `customerUnread` / `vendorUnread` | Number | default `0` — okunmamış mesaj rozetleri |
| `lastMessageAt` / `lastMessagePreview` | Date / String | liste ekranlarında mesaj dizisini çekmeden önizleme |

**Index:** `vendorId + createdAt` (vendor panelinde listeleme için).

**Not:** Liste endpoint'leri `messages` alanını döndürmez; yazışma sadece `GET /leads/:id` ile gelir (erişim: teklifin müşterisi, vendor sahibi, admin salt okunur — diğerlerine 404).

---

## Review
| Alan | Tip | Not |
|---|---|---|
| `_id` | ObjectId | |
| `vendorId` | ObjectId ref `Vendor` | required, index |
| `userId` | ObjectId ref `User` | required |
| `rating` | Number (1-5) | required |
| `comment` | String | required |
| `status` | String enum `REVIEW_STATUS` | default `pending` — admin onayından geçer |

**Index:** `vendorId + status`. Bir kullanıcı aynı vendor'a birden fazla review bırakamaz → `{ vendorId, userId }` unique compound index.

**Kural:** Review `approved` olduğunda `Vendor.avgRating` ve `Vendor.reviewCount` yeniden hesaplanır (tek merkezi fonksiyon, `packages/utils` veya api içinde `services/reviewService.js`).

---

## Favorite
`User.favorites` alanı array olarak tutulduğu için ayrı koleksiyon **gerekmiyor** — basitlik için User içine gömüldü. (Ölçek büyürse ayrı koleksiyona taşınabilir, MVP'de gereksiz karmaşıklık.)

---

## BlogPost
| Alan | Tip | Not |
|---|---|---|
| `_id` | ObjectId | |
| `title` | String | required |
| `slug` | String | required, unique, index — `/blog/[slug]` |
| `content` | String | Markdown veya HTML |
| `coverImage` | String | disk path |
| `tags` | [String] | ör. `dugun`, `orkestra` — kategori ile internal link kurmak için |
| `relatedCategory` | String enum `CATEGORIES.slug` | opsiyonel, ilgili kategori sayfasına link için |
| `authorId` | ObjectId ref `User` (admin) | |
| `seoTitle` | String | opsiyonel override |
| `seoDescription` | String | opsiyonel override |
| `publishedAt` | Date | null ise taslak, sitemap'e girmez |

**Index:** `slug` unique, `publishedAt` (yayında olanları filtrelemek için).

---

## AdminAuditLog
Güvenlik bölümünde zorunlu tutulan admin işlem kaydı.

| Alan | Tip | Not |
|---|---|---|
| `_id` | ObjectId | |
| `adminId` | ObjectId ref `User` | required |
| `action` | String | ör. `vendor.approve`, `vendor.reject`, `review.remove` |
| `targetType` | String | ör. `Vendor`, `Review` |
| `targetId` | ObjectId | |
| `details` | Object | serbest — ne değişti |

**Index:** `adminId + createdAt`.

---

## Şema Dosya Yapısı (apps/api)
```
/apps/api/src/models
  User.js
  Vendor.js
  LeadRequest.js
  Review.js
  BlogPost.js
  AdminAuditLog.js
/apps/api/src/services
  vendorService.js     -> onay akışı, approved-only query helper
  reviewService.js      -> review onayı + avgRating yeniden hesaplama
  leadService.js
```

Reusability kuralı gereği: "approved vendor getir" gibi tekrar eden sorgular `vendorService.js` içinde tek fonksiyonda yaşar, controller'lar bu fonksiyonu çağırır — aynı Mongo query iki yerde yazılmaz.
