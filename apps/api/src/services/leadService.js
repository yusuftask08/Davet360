import mongoose from 'mongoose';
import { VENDOR_STATUS, LEAD_STATUS, ROLES } from '@repo/constants';
import { LeadRequest, Vendor, User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sendNewLeadEmail, sendLeadMessageEmail, sendLeadStatusEmail } from './emailService.js';
import { env } from '../config/env.js';

// Liste ekranları mesaj dizisini taşımaz — sadece rozet/önizleme alanları döner.
const LIST_PROJECTION = '-messages';
const MAX_MESSAGES_PER_LEAD = 300;

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
  return LeadRequest.find({ vendorId }).select(LIST_PROJECTION).sort({ createdAt: -1 }).limit(200);
}

// "Hesabım" sayfası — müşterinin giriş yapmışken gönderdiği teklif taleplerinin geçmişi.
export async function listLeadsForCustomer(userId) {
  return LeadRequest.find({ customerUserId: userId })
    .select(LIST_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(200)
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
      .select(LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('vendorId', 'businessName slug category'),
    LeadRequest.countDocuments(),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

// Teklifi görüntüleyenin bu teklifle ilişkisi: müşterisi mi, işletme sahibi mi, admin mi?
// Hiçbiri değilse 404 (403 yerine) — teklifin varlığı da sızdırılmaz.
async function loadLeadWithAccess(leadId, user) {
  if (!mongoose.isValidObjectId(leadId)) throw new ApiError(404, 'Teklif talebi bulunamadı');
  const lead = await LeadRequest.findById(leadId);
  if (!lead) throw new ApiError(404, 'Teklif talebi bulunamadı');

  const vendor = await Vendor.findById(lead.vendorId).select('businessName slug category citySlug ownerId');
  const isCustomer = lead.customerUserId?.toString() === user.sub;
  const isVendor = vendor?.ownerId?.toString() === user.sub;
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isCustomer && !isVendor && !isAdmin) throw new ApiError(404, 'Teklif talebi bulunamadı');

  const side = isVendor ? 'vendor' : isCustomer ? 'customer' : 'admin';
  return { lead, vendor, side };
}

function serializeLead(lead, vendor, side) {
  const data = lead.toObject();
  data.vendor = vendor ? { _id: vendor._id, businessName: vendor.businessName, slug: vendor.slug, category: vendor.category, citySlug: vendor.citySlug } : null;
  data.viewerSide = side;
  return data;
}

export async function getLeadForUser(leadId, user) {
  const { lead, vendor, side } = await loadLeadWithAccess(leadId, user);
  // Açan taraf için okunmamışlar sıfırlanır — admin görüntülemesi kimsenin sayacını değiştirmez.
  if (side === 'vendor' && lead.vendorUnread > 0) {
    lead.vendorUnread = 0;
    await lead.save();
  } else if (side === 'customer' && lead.customerUnread > 0) {
    lead.customerUnread = 0;
    await lead.save();
  }
  return serializeLead(lead, vendor, side);
}

export async function addLeadMessage(leadId, user, body) {
  const { lead, vendor, side } = await loadLeadWithAccess(leadId, user);
  if (side === 'admin') throw new ApiError(403, 'Admin yazışmaya katılamaz');
  if (lead.messages.length >= MAX_MESSAGES_PER_LEAD) {
    throw new ApiError(400, 'Bu teklif için mesaj sınırına ulaşıldı, lütfen telefonla iletişime geçin');
  }

  const recipientHadUnread = side === 'vendor' ? lead.customerUnread > 0 : lead.vendorUnread > 0;
  lead.messages.push({ senderRole: side, senderUserId: user.sub, body });
  lead.lastMessageAt = new Date();
  lead.lastMessagePreview = body.slice(0, 140);
  if (side === 'vendor') {
    lead.customerUnread += 1;
    // İşletmenin ilk cevabı talebi otomatik "görüşülüyor"a çeker.
    if (lead.status === LEAD_STATUS.NEW) lead.status = LEAD_STATUS.CONTACTED;
  } else {
    lead.vendorUnread += 1;
  }
  await lead.save();

  if (!recipientHadUnread) {
    notifyNewMessage(lead, vendor, side, body).catch((err) => console.error('[email] mesaj bildirimi başarısız', err));
  }
  return serializeLead(lead, vendor, side);
}

async function notifyNewMessage(lead, vendor, side, body) {
  if (side === 'vendor') {
    const to = await customerEmailFor(lead);
    if (!to) return;
    await sendLeadMessageEmail(to, {
      senderName: vendor.businessName,
      businessName: vendor.businessName,
      preview: body.slice(0, 500),
      url: `${env.webUrl}/tr/account/leads/${lead._id}`,
    });
  } else {
    const owner = await User.findById(vendor.ownerId).select('email');
    if (!owner?.email) return;
    await sendLeadMessageEmail(owner.email, {
      senderName: lead.customerName,
      businessName: vendor.businessName,
      preview: body.slice(0, 500),
      url: `${env.panelUrl}/vendor/leads/${lead._id}`,
    });
  }
}

async function customerEmailFor(lead) {
  if (lead.customerEmail) return lead.customerEmail;
  if (!lead.customerUserId) return null;
  const customer = await User.findById(lead.customerUserId).select('email');
  return customer?.email ?? null;
}

export async function updateLeadStatus(leadId, user, status) {
  const { lead, vendor, side } = await loadLeadWithAccess(leadId, user);
  if (side !== 'vendor') throw new ApiError(403, 'Teklif durumunu sadece işletme değiştirebilir');
  if (lead.status === status) return serializeLead(lead, vendor, side);

  lead.status = status;
  await lead.save();

  customerEmailFor(lead)
    .then((to) =>
      to
        ? sendLeadStatusEmail(to, {
            businessName: vendor.businessName,
            status,
            url: `${env.webUrl}/tr/account/leads/${lead._id}`,
          })
        : null,
    )
    .catch((err) => console.error('[email] durum bildirimi başarısız', err));

  return serializeLead(lead, vendor, side);
}
