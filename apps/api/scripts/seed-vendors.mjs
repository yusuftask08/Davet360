// Yerel geliştirme veritabanına gerçekçi test vendor'ları ekler — her kategoride en az bir
// şehirde onaylı işletme olsun diye (anasayfadaki "Popüler Etkinlik Alanları" linkleri 404
// vermesin). Idempotent: aynı slug'a sahip vendor zaten varsa atlanır, tekrar tekrar
// çalıştırmak güvenlidir. Sadece local/dev DB'ye yazar, production'a dokunmaz.
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { User, Vendor } from '../src/models/index.js';
import { slugify } from '@repo/utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../uploads');
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/pazaryeri';

// Şehir merkezi yaklaşık koordinatları — vendor detay sayfasındaki harita için. Her vendor'a
// küçük bir rastgele sapma (~±2km) eklenir ki aynı şehirdeki birden fazla işletme haritada
// tam üst üste binmesin.
const CITY_COORDS = {
  İstanbul: [28.9784, 41.0082],
  Ankara: [32.8597, 39.9334],
  İzmir: [27.1428, 38.4237],
  Bursa: [29.0665, 40.1826],
  Antalya: [30.7133, 36.8969],
  Adana: [35.3213, 37.0],
  Konya: [32.4932, 37.8746],
  Gaziantep: [37.3833, 37.0662],
  Kayseri: [35.4787, 38.7312],
  Mersin: [34.6415, 36.8121],
  Eskişehir: [30.5206, 39.7767],
  Samsun: [36.33, 41.2867],
  Kocaeli: [29.8815, 40.8533],
  Denizli: [29.0864, 37.7765],
  Trabzon: [39.7168, 41.0027],
  Şanlıurfa: [38.7969, 37.1591],
  Diyarbakır: [40.2306, 37.9144],
  Malatya: [38.3095, 38.3552],
  Kahramanmaraş: [36.9371, 37.5858],
  Van: [43.4089, 38.4891],
  Manisa: [27.4289, 38.6191],
  Balıkesir: [27.8826, 39.6484],
};

function jitteredLocation(city) {
  const coords = CITY_COORDS[city];
  if (!coords) return null;
  const [lng, lat] = coords;
  const jitter = () => (Math.random() - 0.5) * 0.04;
  return { type: 'Point', coordinates: [lng + jitter(), lat + jitter()] };
}

const SEED_VENDORS = [
  {
    category: 'dugun-mekani',
    city: 'Ankara',
    businessName: 'Başkent Davet Bahçesi',
    description: 'Şehir merkezine yakın, 400 kişi kapasiteli, bahçe konseptli davet alanı. İç ve dış mekan seçenekleri mevcuttur.',
    phone: '+905321234501',
    priceRange: { min: 180000, max: 320000 },
    capacity: 400,
    rating: 4.6,
    reviewCount: 18,
  },
  {
    category: 'dugun-organizasyonu',
    city: 'İzmir',
    businessName: 'Ege Düğün Organizasyon',
    description: 'Konseptten uygulamaya tüm süreci yöneten butik düğün planlama ajansı. Kıyı ve bağ evi düğünlerinde uzmanız.',
    phone: '+905321234502',
    rating: 4.8,
    reviewCount: 24,
  },
  {
    category: 'dugun-organizasyonu',
    city: 'Bursa',
    businessName: 'Zarif Düğün Planlama',
    description: 'Uludağ eteklerinde ve şehir merkezinde, bütçenize uygun düğün organizasyonu paketleri sunuyoruz.',
    phone: '+905321234503',
  },
  {
    category: 'nisan-organizasyonu',
    city: 'Antalya',
    businessName: 'Akdeniz Nişan Organizasyon',
    description: 'Deniz manzaralı mekanlarda romantik nişan törenleri planlıyor, dekorasyondan davetliye tüm detayları yönetiyoruz.',
    phone: '+905321234504',
    rating: 4.7,
    reviewCount: 11,
  },
  {
    category: 'nisan-organizasyonu',
    city: 'Adana',
    businessName: 'Çukurova Nişan Evi',
    description: 'Geleneksel ve modern nişan törenleri için mekan, dekorasyon ve ikram hizmetleri tek pakette.',
    phone: '+905321234505',
  },
  {
    category: 'kina-gecesi',
    city: 'Konya',
    businessName: 'Anadolu Kına Gecesi Organizasyon',
    description: 'Geleneksel kına gecenizi halay ekibi, kına tepsisi ve özel aydınlatmayla unutulmaz kılıyoruz.',
    phone: '+905321234506',
    rating: 4.9,
    reviewCount: 15,
  },
  {
    category: 'kina-gecesi',
    city: 'Gaziantep',
    businessName: 'Fıstık Kına Sarayı',
    description: 'Güneydoğu geleneklerine uygun, canlı davul-zurna eşliğinde kına gecesi organizasyonu.',
    phone: '+905321234507',
  },
  {
    category: 'sunnet-organizasyonu',
    city: 'Kayseri',
    businessName: 'Erciyes Sünnet Organizasyon',
    description: 'Salon kiralama, kıyafet, kadife koltuk ve eğlence programı dahil komple sünnet düğünü paketleri.',
    phone: '+905321234508',
  },
  {
    category: 'sunnet-organizasyonu',
    city: 'Mersin',
    businessName: 'Akdeniz Sünnet Sarayı',
    description: 'Çocuğunuzun özel gününde profesyonel animasyon ve fotoğraf ekibiyle eksiksiz organizasyon.',
    phone: '+905321234509',
    rating: 4.5,
    reviewCount: 9,
  },
  {
    category: 'dogum-gunu-organizasyonu',
    city: 'Eskişehir',
    businessName: 'Renkli Parti Organizasyon',
    description: 'Temalı doğum günü partileri, balon süsleme ve animasyon karakterleriyle çocuklara unutulmaz kutlamalar.',
    phone: '+905321234510',
    rating: 4.6,
    reviewCount: 21,
  },
  {
    category: 'dogum-gunu-organizasyonu',
    city: 'Samsun',
    businessName: 'Karadeniz Doğum Günü Evi',
    description: 'Yetişkin ve çocuk doğum günü kutlamaları için salon, pasta ve dekorasyon çözümleri.',
    phone: '+905321234511',
  },
  {
    category: 'baby-shower',
    city: 'Kocaeli',
    businessName: 'Minik Adımlar Baby Shower',
    description: 'Zarif dekorasyon ve fotoğraf köşeleriyle anneadaylarına özel baby shower organizasyonu.',
    phone: '+905321234512',
    rating: 4.8,
    reviewCount: 7,
  },
  {
    category: 'baby-shower',
    city: 'Denizli',
    businessName: 'Şeker Bebek Organizasyon',
    description: 'Cinsiyet partisi ve baby shower için tam kapsamlı dekorasyon ve ikram hizmeti.',
    phone: '+905321234513',
  },
  {
    category: 'mezuniyet-organizasyonu',
    city: 'Trabzon',
    businessName: 'Karadeniz Mezuniyet Organizasyon',
    description: 'Okul ve üniversite mezuniyet törenleri, balo organizasyonu ve toplu fotoğraf çekimi.',
    phone: '+905321234514',
  },
  {
    category: 'mezuniyet-organizasyonu',
    city: 'Şanlıurfa',
    businessName: 'Balıklıgöl Mezuniyet Etkinlik',
    description: 'Mezuniyet balosu, kep atma töreni ve toplu kutlama organizasyonlarında uzman ekip.',
    phone: '+905321234515',
    rating: 4.4,
    reviewCount: 6,
  },
  {
    category: 'kurumsal-etkinlik',
    city: 'Diyarbakır',
    businessName: 'Güneydoğu Kurumsal Etkinlik',
    description: 'Şirket lansmanları, yıl sonu toplantıları ve kurumsal davetler için uçtan uca organizasyon.',
    phone: '+905321234516',
  },
  {
    category: 'kurumsal-etkinlik',
    city: 'Malatya',
    businessName: 'Kayısı Diyarı Organizasyon',
    description: 'Konferans, ürün lansmanı ve kurumsal yemek organizasyonlarında profesyonel çözümler.',
    phone: '+905321234517',
    rating: 4.7,
    reviewCount: 13,
  },
  {
    category: 'orkestra-muzik',
    city: 'Kahramanmaraş',
    businessName: 'Maraş Orkestra ve Müzik',
    description: 'Düğün, nişan ve kına geceleri için canlı orkestra, DJ ve ses sistemi kiralama hizmeti.',
    phone: '+905321234518',
    rating: 4.9,
    reviewCount: 19,
  },
  {
    category: 'fotograf-video',
    city: 'Van',
    businessName: 'Van Gölü Fotoğraf & Video',
    description: 'Düğün, nişan ve özel gün çekimlerinde drone destekli fotoğraf ve video hizmeti.',
    phone: '+905321234519',
  },
  {
    category: 'fotograf-video',
    city: 'Manisa',
    businessName: 'Spil Dağı Prodüksiyon',
    description: 'Sinematik düğün filmi ve profesyonel fotoğraf çekimi, aynı gün teslim albüm seçeneği.',
    phone: '+905321234520',
    rating: 4.8,
    reviewCount: 27,
  },
  {
    category: 'catering-ikram',
    city: 'Balıkesir',
    businessName: 'Ege Catering & İkram',
    description: 'Açık büfe, canlı istasyon ve özel menü seçenekleriyle her ölçekte etkinliğe catering hizmeti.',
    phone: '+905321234521',
  },
  {
    category: 'catering-ikram',
    city: 'İstanbul',
    businessName: 'Boğaz Catering Hizmetleri',
    description: 'Kurumsal ve özel etkinlikler için lüks açık büfe ve canlı yemek istasyonları.',
    phone: '+905321234522',
    rating: 4.6,
    reviewCount: 22,
  },
  {
    category: 'pasta-tatli',
    city: 'Ankara',
    businessName: 'Başkent Pasta Atölyesi',
    description: 'Özel tasarım düğün pastaları, tatlı büfesi ve şekerleme masası hazırlıyoruz.',
    phone: '+905321234523',
    rating: 4.9,
    reviewCount: 16,
  },
  {
    category: 'dekorasyon-balon',
    city: 'İzmir',
    businessName: 'Renk Cümbüşü Dekorasyon',
    description: 'Balon tak, çiçek duvarı ve tema dekorasyonuyla mekanınızı baştan yaratıyoruz.',
    phone: '+905321234524',
  },
  {
    category: 'dekorasyon-balon',
    city: 'Antalya',
    businessName: 'Akdeniz Balon Sanatı',
    description: 'Doğum günü, baby shower ve düğün için özel balon kemeri ve dekor tasarımı.',
    phone: '+905321234525',
    rating: 4.5,
    reviewCount: 8,
  },
  {
    category: 'davetiye',
    city: 'İstanbul',
    businessName: 'Zarif Davetiye Atölyesi',
    description: 'El yapımı ve dijital baskı davetiye tasarımı, zarf ve kırtasiye seçenekleriyle.',
    phone: '+905321234526',
  },
  {
    category: 'davetiye',
    city: 'Bursa',
    businessName: 'İpek Davetiye',
    description: 'Klasik ve modern davetiye koleksiyonları, kişiye özel tasarım ve hızlı baskı hizmeti.',
    phone: '+905321234527',
    rating: 4.7,
    reviewCount: 10,
  },
  {
    category: 'gelinlik-damatlik',
    city: 'Ankara',
    businessName: 'Beyaz Rüya Gelinlik Evi',
    description: 'Yerli ve ithal gelinlik koleksiyonları, damatlık kiralama ve tadilat hizmeti.',
    phone: '+905321234528',
    rating: 4.8,
    reviewCount: 31,
  },
  {
    category: 'gelinlik-damatlik',
    city: 'Adana',
    businessName: 'Çukurova Gelinlik & Damatlık',
    description: 'Geniş beden seçenekleriyle gelinlik, damatlık ve nişanlık kiralama/satış hizmeti.',
    phone: '+905321234529',
  },
  {
    category: 'kuafor-makyaj',
    city: 'Konya',
    businessName: 'Gelin Stüdyosu Kuaför & Makyaj',
    description: 'Deneme provası dahil, gelin saçı ve makyajında uzman ekip. Yerinde hizmet seçeneği mevcut.',
    phone: '+905321234530',
    rating: 4.9,
    reviewCount: 24,
  },
  {
    category: 'kuafor-makyaj',
    city: 'Gaziantep',
    businessName: 'Şah Makyaj Atölyesi',
    description: 'Gelin, nişanlı ve davetli makyajında kalıcı ürünlerle profesyonel hizmet.',
    phone: '+905321234531',
  },
  {
    category: 'animasyon-cocuk',
    city: 'Kayseri',
    businessName: 'Renkli Dünya Çocuk Animasyon',
    description: 'Sevilen çizgi film karakterleriyle doğum günü ve okul etkinliklerinde canlı animasyon.',
    phone: '+905321234532',
    rating: 4.6,
    reviewCount: 14,
  },
  {
    category: 'animasyon-cocuk',
    city: 'Mersin',
    businessName: 'Mutlu Karakterler Animasyon',
    description: 'Palyaço, maskot ve yüz boyama dahil çocuk etkinliklerinde tam kapsamlı eğlence hizmeti.',
    phone: '+905321234533',
  },
];

async function downloadImage(seed, index) {
  const filename = `seed-${seed}-${index}.jpg`;
  const dest = path.join(uploadDir, filename);
  if (fs.existsSync(dest)) return `/uploads/${filename}`;

  const res = await fetch(`https://picsum.photos/seed/${seed}/900/600`);
  if (!res.ok) throw new Error(`Görsel indirilemedi: ${seed}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(dest, buffer);
  return `/uploads/${filename}`;
}

async function getOrCreateSeedOwner() {
  const email = 'seed-vendors@davet360.local';
  let owner = await User.findOne({ email });
  if (owner) return owner;

  const passwordHash = await bcrypt.hash('seed-not-a-real-login-' + Date.now(), 10);
  owner = await User.create({
    name: 'Davet360 Seed',
    email,
    passwordHash,
    role: 'vendor',
  });
  return owner;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB bağlantısı kuruldu:', MONGO_URI);

  const owner = await getOrCreateSeedOwner();
  let created = 0;
  let skipped = 0;
  let backfilled = 0;

  for (const [index, v] of SEED_VENDORS.entries()) {
    const slug = slugify(`${v.businessName}`);
    const existing = await Vendor.findOne({ slug });
    if (existing) {
      skipped += 1;
      // Daha önce konumsuz eklenmiş vendor'ları geriye dönük güncelle — script tekrar
      // çalıştırıldığında yeni alanlar (konum gibi) eski kayıtlara da işlensin diye.
      if (!existing.location?.coordinates?.length) {
        const location = jitteredLocation(v.city);
        if (location) {
          existing.location = location;
          await existing.save();
          backfilled += 1;
        }
      }
      continue;
    }

    let images = [];
    try {
      images = [await downloadImage(slug, 1)];
    } catch (err) {
      console.warn(`  ! ${v.businessName}: görsel indirilemedi (${err.message}), görselsiz devam ediliyor`);
    }

    const location = jitteredLocation(v.city);

    await Vendor.create({
      ownerId: owner._id,
      businessName: v.businessName,
      slug,
      category: v.category,
      description: v.description,
      city: v.city,
      citySlug: slugify(v.city),
      phone: v.phone,
      images,
      ...(location ? { location } : {}),
      ...(v.priceRange ? { priceRange: v.priceRange } : {}),
      ...(v.capacity ? { capacity: v.capacity } : {}),
      status: 'approved',
      approvedAt: new Date(),
      avgRating: v.rating ?? 0,
      reviewCount: v.reviewCount ?? 0,
    });
    created += 1;
    console.log(`  + ${v.businessName} (${v.city} · ${v.category})`);
  }

  console.log(
    `\nBitti. ${created} yeni vendor eklendi, ${skipped} zaten vardı (${backfilled} tanesine konum eklendi).`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed script hata verdi:', err);
  process.exit(1);
});
