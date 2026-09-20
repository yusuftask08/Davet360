import { VENDOR_STATUS } from '@repo/constants';
import { LeadRequest, Vendor, User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sendNewLeadEmail } from './emailService.js';
import { env } from '../config/env.js';

export async function createLead(data) {
  const vendor = await Vendor.findById(data.vendorId);
  if (!vendor || vendor.status !== VENDOR_STATUS.APPROVED) {
    throw new ApiError(404, 'Vendor bulunamadı');
  }

  const lead = await LeadRequest.create(data);

  // Bildirim gönderimi lead oluşturmayı asla bloklamaz/başarısız kılmaz — SMTP çökse bile
  // müşteri teklif talebini sorunsuz gönderebilmeli.
  notifyVendorOfNewLead(vendor, lead).catch((err) => console.error('[email] yeni teklif bildirimi başarısız', err));

  return lead;
}

async function notifyVendorOfNewLead(vendor, lead) {
  const owner = await User.findById(vendor.ownerId);
  if (!owner?.email) return;

  await sendNewLeadEmail(owner.email, {
    businessName: vendor.businessName,
    customerName: lead.customerName,
    customerPhone: lead.customerPhone,
    message: lead.message,
    panelUrl: env.panelUrl,
  });
}

export async function listLeadsForVendor(vendorId) {
  return LeadRequest.find({ vendorId }).sort({ createdAt: -1 });
}

// "Hesabım" sayfası — müşterinin giriş yapmışken gönderdiği teklif taleplerinin geçmişi.
export async function listLeadsForCustomer(userId) {
  return LeadRequest.find({ customerUserId: userId })
    .sort({ createdAt: -1 })
    .populate('vendorId', 'businessName slug category citySlug');
}

// Admin paneli — tüm vendor'lardaki teklif taleplerine tek ekrandan bakabilmek için
// (spam/kalite denetimi, hangi vendor'lar hiç talep almıyor gibi soruları cevaplar).
export async function listLeadsAdmin({ page = 1, limit = 30 }) {
  const safeLimit = Math.min(Number(limit) || 30, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    LeadRequest.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('vendorId', 'businessName slug category'),
    LeadRequest.countDocuments(),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}
