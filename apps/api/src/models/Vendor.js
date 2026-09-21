import mongoose from 'mongoose';
import { CATEGORY_SLUGS, VENDOR_STATUS, VENDOR_STATUS_LIST } from '@repo/constants';

const vendorSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, enum: CATEGORY_SLUGS, required: true, index: true },
    description: { type: String, required: true },
    city: { type: String, required: true, index: true },
    // "İstanbul" -> "istanbul" gibi normalize edilmiş hali — /[category]/[city] SEO URL'i ve
    // hızlı/indeksli filtreleme bunun üzerinden çalışır, city (görünen ad) sadece UI için.
    citySlug: { type: String, required: true, index: true },
    // Not: `type` alanında default VERİLMEZ — location boş bırakılırsa Mongoose'un `minimize`
    // ayarı boş nested objeyi ({}) kaydetmeden atar. Default konsaydı yarı-dolu ({type:'Point'}
    // ama coordinates yok) bir obje kaydedilir ve 2dsphere index "Can't extract geo keys" ile patlar.
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String },
    images: [{ type: String }],
    priceRange: {
      min: { type: Number },
      max: { type: Number },
    },
    capacity: { type: Number },
    // Düz string dizisi (sabit enum değil) — AMENITY_KEYS şu an tek ortak liste ama ileride
    // kategoriye özel listelere geçilirse şema değişikliği gerekmeden genişletilebilir.
    amenities: [{ type: String }],
    status: { type: String, enum: VENDOR_STATUS_LIST, default: VENDOR_STATUS.PENDING, index: true },
    // Vendor'ın reddedilme/askıya alınma nedeni — admin girer, vendor kendi panelinde görür.
    // approve/reactivate ile temizlenir, çünkü eski bir red/askı notu güncel durumu yanlış yansıtır.
    statusReason: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true },
);

vendorSchema.index({ location: '2dsphere' });
vendorSchema.index({ businessName: 'text', description: 'text' });
vendorSchema.index({ category: 1, citySlug: 1 });

export const Vendor = mongoose.model('Vendor', vendorSchema);
