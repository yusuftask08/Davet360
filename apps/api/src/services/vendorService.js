import { ROLES, VENDOR_STATUS, VENDOR_STATUS_LIST } from '@repo/constants';
import { slugify } from '@repo/utils';
import { User, Vendor } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sendVendorApprovedEmail, sendNewVendorApplicationEmail, sendVendorStatusChangeEmail } from './emailService.js';
import { env } from '../config/env.js';

// "Onaylı vendor getir" sorgusu tek yerde yaşar (DRY) — her controller bunu çağırır,
// aynı Mongo query iki yerde yazılmaz.
export function approvedVendorFilter(extra = {}) {
  return { status: VENDOR_STATUS.APPROVED, ...extra };
}

// sort query param -> Mongo sort. "rating" ve "budget" seçenekleri, işletme kaydında
// girilen gerçek alanlara (avgRating, priceRange) dayanır — uydurma bir sıralama değil.
const VENDOR_SORTS = {
  rating: { avgRating: -1, reviewCount: -1 },
  'budget-asc': { 'priceRange.min': 1 },
  'budget-desc': { 'priceRange.max': -1 },
  default: { createdAt: -1 },
};

export async function listApprovedVendors({
  category,
  citySlug,
  search,
  maxBudget,
  minCapacity,
  amenities,
  sort,
  page = 1,
  limit = 20,
}) {
  const filter = approvedVendorFilter();
  if (category) filter.category = category;
  if (citySlug) filter.citySlug = citySlug;
  if (search) filter.$text = { $search: search };
  // Bütçe/kapasite belirtmemiş vendor'lar bu filtreler aktifken hariç tutulur — kullanıcı
  // "500.000₺ altı" dediğinde fiyatını hiç belirtmemiş bir vendor'ı göstermek yanıltıcı olur.
  if (maxBudget) filter['priceRange.min'] = { $lte: Number(maxBudget) };
  if (minCapacity) filter.capacity = { $gte: Number(minCapacity) };
  // Olanaklar (amenities) — vendor kayıt formunda işaretlenen gerçek alan. $all: seçilen
  // her olanağı karşılayan vendor'lar (kısmi eşleşme değil, hepsi birden aranıyor).
  const amenityList = (Array.isArray(amenities) ? amenities : amenities?.split(',')) ?? [];
  const cleanAmenities = amenityList.map((a) => a.trim()).filter(Boolean);
  if (cleanAmenities.length > 0) filter.amenities = { $all: cleanAmenities };

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const sortSpec = VENDOR_SORTS[sort] ?? VENDOR_SORTS.default;

  const [items, total] = await Promise.all([
    Vendor.find(filter).sort(sortSpec).skip(skip).limit(safeLimit),
    Vendor.countDocuments(filter),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

// /[category]/[city] SEO sayfalarını ve sitemap'i üretmek için — sadece GERÇEKTEN onaylı
// vendor'ı olan şehirler döner, boş/ince (thin) SEO sayfası oluşmaz.
export async function listVendorCities(category) {
  const filter = approvedVendorFilter();
  if (category) filter.category = category;

  return Vendor.aggregate([
    { $match: filter },
    { $group: { _id: '$citySlug', city: { $first: '$city' }, count: { $sum: 1 } } },
    { $project: { _id: 0, citySlug: '$_id', city: 1, count: 1 } },
    { $sort: { count: -1 } },
  ]);
}

// Anasayfada "Popüler" olarak gösterilecek kategori+şehir kombinasyonları — sadece gerçekten
// onaylı vendor'ı olan kombinasyonlar döner (thin/empty SEO sayfasına link vermemek için).
export async function listPopularCombos(limit = 8) {
  return Vendor.aggregate([
    { $match: approvedVendorFilter() },
    { $group: { _id: { category: '$category', citySlug: '$citySlug' }, city: { $first: '$city' }, count: { $sum: 1 } } },
    { $project: { _id: 0, category: '$_id.category', citySlug: '$_id.citySlug', city: 1, count: 1 } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
}

// Anasayfada öne çıkarılacak işletmeler — en yüksek puanlı, en az 1 yorumu olan onaylı
// vendor'lar. Yorumu olmayan vendor'lar "öne çıkan" listesinde yanıltıcı olur, hariç tutulur.
export async function listFeaturedVendors(limit = 6) {
  return Vendor.find(approvedVendorFilter({ reviewCount: { $gt: 0 } }))
    .sort({ avgRating: -1, reviewCount: -1 })
    .limit(limit);
}

// Anasayfada şehir başına ayrı satır göstermek için (Airbnb'nin "X yakınlarındaki popüler
// evler" satırları gibi) — en çok onaylı işletmesi olan şehirler, kategori ayrımı yapmadan.
export async function listTopCities(limit = 5) {
  return Vendor.aggregate([
    { $match: approvedVendorFilter() },
    { $group: { _id: '$citySlug', city: { $first: '$city' }, count: { $sum: 1 } } },
    { $project: { _id: 0, citySlug: '$_id', city: 1, count: 1 } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
}

// Bir kategori+şehir sayfasında "ilgili aramalar" için — sadece o şehirde GERÇEKTEN onaylı
// vendor'ı olan diğer kategoriler döner (mevcut kategori hariç). Uydurma/boş öneri yok.
export async function listCategoriesInCity(citySlug, excludeCategory) {
  const filter = approvedVendorFilter({ citySlug });
  if (excludeCategory) filter.category = { $ne: excludeCategory };

  return Vendor.aggregate([
    { $match: filter },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { _id: 0, category: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
}

export async function getApprovedVendorBySlug(slug) {
  const vendor = await Vendor.findOne(approvedVendorFilter({ slug }));
  if (!vendor) {
    throw new ApiError(404, 'Vendor bulunamadı');
  }
  return vendor;
}

export async function createVendorApplication(ownerId, data) {
  const baseSlug = slugify(data.businessName);
  let slug = baseSlug;
  let attempt = 1;
  while (await Vendor.exists({ slug })) {
    slug = `${baseSlug}-${attempt}`;
    attempt += 1;
  }

  // Client { lat, lng } gönderir, Mongo GeoJSON { type: 'Point', coordinates: [lng, lat] } bekler.
  const { location, ...rest } = data;
  const geoLocation = location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined;

  const vendor = await Vendor.create({
    ...rest,
    citySlug: slugify(data.city),
    ...(geoLocation ? { location: geoLocation } : {}),
    ownerId,
    slug,
    status: VENDOR_STATUS.PENDING,
  });

  // Panelin "/vendor" ekranı User.vendorId üzerinden çalışır — başvuru anında set edilmezse
  // kullanıcı kendi ilanını hiç göremez.
  await User.findByIdAndUpdate(ownerId, { vendorId: vendor._id, role: ROLES.VENDOR });

  notifyAdminsOfNewApplication(vendor).catch((err) => console.error('[email] yeni başvuru bildirimi başarısız', err));

  return vendor;
}

async function notifyAdminsOfNewApplication(vendor) {
  const admins = await User.find({ role: ROLES.ADMIN, isActive: true }).select('email');
  const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

  await sendNewVendorApplicationEmail(adminEmails, {
    businessName: vendor.businessName,
    city: vendor.city,
    category: vendor.category,
    adminUrl: env.adminUrl,
  });
}

// Vendor sahibi kendi ilanını düzenler — onay durumu bozulmasın diye önemli alanlar (status,
// approvedBy vs.) buradan asla değiştirilemez, sadece içerik alanları güncellenir.
export async function updateOwnVendor(vendorId, ownerId, data) {
  const vendor = await Vendor.findOne({ _id: vendorId, ownerId });
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

  const { location, city, ...rest } = data;
  Object.assign(vendor, rest);
  if (city) {
    vendor.city = city;
    vendor.citySlug = slugify(city);
  }
  if (location) {
    vendor.location = { type: 'Point', coordinates: [location.lng, location.lat] };
  }

  // Reddedilen bir vendor bilgilerini düzenlediğinde otomatik olarak tekrar admin onay
  // kuyruğuna düşer — aksi halde vendor panelde "düzenle" dese de sonsuza kadar rejected kalır.
  // Suspended kasıtlı olarak dahil değil: askı genelde politika/şikayet kaynaklı olur, profil
  // düzenlemesiyle otomatik yayına dönmemeli, admin'in elle gözden geçirmesi gerekir.
  if (vendor.status === VENDOR_STATUS.REJECTED) {
    vendor.status = VENDOR_STATUS.PENDING;
    vendor.statusReason = '';
  }

  await vendor.save();
  return vendor;
}

export async function listPendingVendors() {
  return Vendor.find({ status: VENDOR_STATUS.PENDING }).sort({ createdAt: 1 });
}

// Admin paneli — durum/kategori/şehir/isim filtreli, tüm statüleri kapsayan liste.
export async function listVendorsAdmin({ status, category, citySlug, search, page = 1, limit = 20 }) {
  const filter = {};
  if (status && VENDOR_STATUS_LIST.includes(status)) filter.status = status;
  if (category) filter.category = category;
  if (citySlug) filter.citySlug = citySlug;
  if (search) filter.businessName = new RegExp(search, 'i');

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Vendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Vendor.countDocuments(filter),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

export async function getVendorByIdAdmin(vendorId) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');
  return vendor;
}

// Admin herhangi bir alanı düzenleyebilir (vendor'ın kendi update'inden farklı olarak status
// dahil) — moderasyon sırasında yanlış girilmiş bir bilgiyi onaylamadan önce düzeltebilmek için.
export async function updateVendorAdmin(vendorId, data) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

  const { location, city, ...rest } = data;
  Object.assign(vendor, rest);
  if (city) {
    vendor.city = city;
    vendor.citySlug = slugify(city);
  }
  if (location) {
    vendor.location = { type: 'Point', coordinates: [location.lng, location.lat] };
  }

  await vendor.save();
  return vendor;
}

export async function approveVendor(vendorId, adminId) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

  vendor.status = VENDOR_STATUS.APPROVED;
  vendor.statusReason = '';
  vendor.approvedBy = adminId;
  vendor.approvedAt = new Date();
  await vendor.save();

  notifyVendorOfApproval(vendor).catch((err) => console.error('[email] onay bildirimi başarısız', err));

  return vendor;
}

async function notifyVendorOfApproval(vendor) {
  const owner = await User.findById(vendor.ownerId);
  if (!owner?.email) return;

  await sendVendorApprovedEmail(owner.email, { businessName: vendor.businessName, webUrl: env.webUrl });
}

// reject/suspend sonrası vendor'a e-posta ile haber verir — sadece panel banner'ına güvenmek
// yetmez, çoğu vendor bildirimi ancak e-postayla görür.
async function notifyVendorOfStatusChange(vendor) {
  const owner = await User.findById(vendor.ownerId);
  if (!owner?.email) return;

  await sendVendorStatusChangeEmail(owner.email, {
    businessName: vendor.businessName,
    status: vendor.status,
    reason: vendor.statusReason,
    panelUrl: env.panelUrl,
  });
}

export async function rejectVendor(vendorId, reason = '') {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

  vendor.status = VENDOR_STATUS.REJECTED;
  vendor.statusReason = reason.trim();
  await vendor.save();

  notifyVendorOfStatusChange(vendor).catch((err) => console.error('[email] red bildirimi başarısız', err));

  return vendor;
}

// Daha önce onaylanmış bir vendor'ı sonradan yayından kaldırma (silme değil — geri alınabilir).
export async function suspendVendor(vendorId, reason = '') {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

  vendor.status = VENDOR_STATUS.SUSPENDED;
  vendor.statusReason = reason.trim();
  await vendor.save();

  notifyVendorOfStatusChange(vendor).catch((err) => console.error('[email] askı bildirimi başarısız', err));

  return vendor;
}

export async function reactivateVendor(vendorId) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

  vendor.status = VENDOR_STATUS.APPROVED;
  vendor.statusReason = '';
  await vendor.save();
  return vendor;
}
