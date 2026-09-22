# Merasim360 – Kullanıcı Sözleşmesi için Proje Brifi

2026-09-22

## Platform Özeti

**Merasim360**, düğün/nişan/kına/sünnet, doğum günü, mezuniyet, kurumsal etkinlik gibi "davet edilebilecek her etkinlik" için tedarikçi (mekan, orkestra, fotoğraf-video, catering, dekorasyon, davetiye, gelinlik, kuaför vb.) bulan bir **dizin + teklif alma pazaryeridir**. Türkiye genelinde hizmet verir, şehir sabit bir listeye bağlı değildir. Bir web sitesi (müşteri tarafı, TR/EN) ve ayrı bir panel (vendor + admin, sadece TR) olmak üzere iki arayüzü vardır.

## İş Modeli ve Ücretlendirme

- Platform yalnızca **dizin + teklif yönlendirme** yapar; ödeme/rezervasyon işlemi **platform üzerinden geçmez**.
- Müşteri bir tedarikçiyi bulur, teklif/mesaj formu doldurur; tedarikçi talebi kendi iletişim kanalından (telefon/e-posta/WhatsApp) yanıtlar.
- MVP aşamasında kullanıcılar (müşteri veya tedarikçi) için **ücretli bir paket/üyelik yok** — platform ücretsiz kullanılır.
- Platform, taraflar arasında kurulan hizmet ilişkisine (fiyat, teslimat, kalite vb.) taraf değildir; sadece iletişimi başlatır.

## Kullanıcı Rolleri

- **Müşteri (ziyaretçi veya kayıtlı):** arama/filtreleme, tedarikçi profili görüntüleme, teklif talebi gönderme (misafir olarak da gönderilebilir), favorilere ekleme, yorum/puan bırakma (kayıtlıysa).
- **Tedarikçi (vendor):** kayıt olur, admin onayı sonrası profil/ilan yayına girer, gelen teklif taleplerini görür, ilanını kendi paneli üzerinden düzenler.
- **Admin:** tüm platformu (vendor onay/askıya alma, yorum moderasyonu, kullanıcı yönetimi, blog, işlem geçmişi) tek bir panelden yönetir.

## Toplanan Veri Türleri ve Kullanılan Dış Servisler

Sözleşme + gizlilik metninde tek tek sayılması gereken kalemler:

| Veri / Servis | Nerede kullanılıyor | Not |
| --- | --- | --- |
| Ad soyad, telefon, e-posta | Kayıt, teklif formu, yorum | Zorunlu alan, KVKK kapsamında |
| Etkinlik tarihi/notu | Teklif formu | Müşteri tarafından girilir |
| Şifre (hash'lenmiş) | Kayıtlı kullanıcı/vendor girişi | bcrypt ile hash, ham hali hiç saklanmaz |
| Konum (şehir, opsiyonel harita işaretleme) | Vendor profili | **Google Maps kullanılmıyor** — Leaflet + OpenStreetMap (üçüncü parti API key gerektirmez) |
| E-posta gönderimi | Şifre sıfırlama, vendor onay/teklif bildirimi | Nodemailer + SMTP sağlayıcı (üçüncü parti mail sunucusu — hangi SMTP sağlayıcısı kullanılıyorsa onun adı ve gizlilik politikasına link verilmeli) |
| WhatsApp | Vendor profilinde "WhatsApp'tan Yaz" | `wa.me` dış link, WhatsApp/Meta'nın kendi gizlilik politikasına tabi — sözleşmede üçüncü parti servis olarak belirtilmeli |
| Analytics | Ziyaretçi davranışı | Umami — **kendi sunucumuzda self-hosted**, Google Analytics kullanılmıyor, kişisel veri üçüncü tarafı gönderilmiyor |
| Spam koruma | Kayıt / teklif formu | Altcha (açık kaynak, ücretsiz), reCAPTCHA/Google servisi kullanılmıyor |
| Görsel yükleme | Vendor galeri fotoğrafları | Kendi sunucu diskimizde saklanır, S3/Google Cloud gibi üçüncü depolama yok |
| Çerez / localStorage | Oturum (JWT token) | HttpOnly cookie olarak saklanıyor — zorunlu/işlevsel çerez olarak çerez politikasında açıkça belirtilmeli |

**Önemli:** Projede Google Maps, Google Analytics, Google reCAPTCHA gibi Google servisleri **kullanılmıyor** (bilinçli tercih, ücretli/veri paylaşımlı olduğu için). Sözleşme hazırlanırken "hangi üçüncü taraf servisleri kullanıyoruz" listesi bu tablo üzerinden çıkarılıp KVKK aydınlatma metnine ve gizlilik politikasına yansıtılmalı; kullanılmayan servisler (ör. Google Maps) için "kullanılmamaktadır" ifadesi eklenmesi yanlış anlamayı önler.

## Platformun Rolü ve Sorumluluk Sınırı

- Merasim360 bir **aracı dizin/pazaryeri**dir; tedarikçilerin verdiği hizmetin kalitesi, fiyatı, teslimatı veya sözleşmesi platformun sorumluluğunda değildir — bu, taraflar (müşteri-tedarikçi) arasında kalır.
- Vendor onay süreci bir **kalite göstergesi** olarak sunulur ama platform tedarikçinin hizmetini garanti etmez.
- Yorum/puanlar kullanıcı kaynaklıdır, doğruluğu platform tarafından garanti edilmez (admin moderasyonundan geçer ama içerik kullanıcı beyanıdır).
- Kullanıcının girdiği bilgilerin (iletişim, içerik) doğruluğundan kullanıcı sorumludur.

## Vendor Onay Süreci

Serbest kayıt yok: tedarikçi kayıt olur → başvurusu "beklemede" statüsünde kalır → **admin onaylamadan ilan yayında görünmez**. Onaylı bir ilan admin tarafından sonradan askıya alınabilir (suspend) veya tekrar aktif edilebilir (reactivate). Bu, platformun başlangıçta kalite/güven imajı oluşturması için tercih edildi — sözleşmede "platform herhangi bir hesabı/ilanı kendi takdirine göre onaylamama/askıya alma hakkını saklı tutar" maddesi olmalı.

## İçerik ve Yorum Politikası

- Müşteri, deneyimlediği bir tedarikçiye puan + yorum bırakabilir; yorum **admin onayina düşer**, onaylandıktan sonra yayınlanır ve tedarikçinin ortalama puanını günceller.
- Admin onaylanmış bir yorumu da sonradan yayından kaldırabilir.
- Kullanıcı tarafından girilen hiçbir içerik (yorum, ilan metni, fotoğraf) yasa dışı/yanıltıcı/hakaret içeremez — sözleşmede kullanıcı yükümlülükleri maddesi olarak yer almalı.
- Görsel yükleme: sadece jpg/png/webp kabul edilir, boyut sınırı uygulanır.

## Sözleşmede Yer Alması Gereken Maddeler (checklist)

- [ ] Taraflar ve tanımlar (platform, müşteri, tedarikçi/vendor)
- [ ] Hizmetin tanımı: sadece dizin + teklif yönlendirme, ödeme/rezervasyon aracıűğı yok
- [ ] Ücretsiz kullanım koşulları (MVP'de ücret alınmıyor)
- [ ] Kullanıcı yükümlülükleri (doğru bilgi girme, yasa dışı/yanışltıı içerik yasağı)
- [ ] Vendor onay/ret/askıya alma hakkı platformda saklıdır
- [ ] Sorumluluk reddi: tedarikçi-müşteri arasındaki hizmet ilişkisinden platform sorumlu değildir
- [ ] Fikri mülkiyet (platform tasarımı vs. kullanıcının yüklediği içerik/fotoğraf hakları)
- [ ] **KVKK aydınlatma metni referansı** — hangi kişisel veri (ad, telefon, e-posta, konum, şifre-hash) hangi amaçla ğlenir, ne kadar saklanır
- [ ] **Üçüncü taraf servisleri listesi** — SMTP/e-posta sağlayıcırı, WhatsApp (`wa.me`), OpenStreetMap/Leaflet; **Google servisi kullanılmadığı** açıkça belirtilebilir
- [ ] Çerez politikası — JWT oturum tokenı artık cookie olarak saklanıyor, KVKK çerez aydınlatma metninde zorunlu çerez olarak açıklanmalı
- [ ] Hesap askıya alma/silme koşulları
- [ ] Yorum/puanlama kuralları ve moderasyon hakkı
- [ ] Yaş sınırı (18 yaş altı kullanım koşulu)
- [ ] Uygulanacak hukuk ve yetkili mahkeme (Türkiye)
- [ ] İletişim/şikayet kanalı (`/contact`)
- [ ] Yürürlük tarihi ve güncelleme bildirimi

**Not:** Bu brief taslak niteliktedir; nihai sözleşme metni (kullanım şartları + gizlilik/KVKK) yayına alınmadan önce bir hukukçu tarafından gözden geçirilmelidir.
