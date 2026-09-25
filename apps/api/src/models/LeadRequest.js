import mongoose from 'mongoose';
import { LEAD_STATUS, LEAD_STATUS_LIST } from '@repo/constants';

// Teklif üzerindeki yazışma — mesajlar teklifin içinde tutulur (bir teklifin mesaj sayısı
// sınırlı, ayrı koleksiyona gerek yok; teklif silinirse mesajlar da gider).
const leadMessageSchema = new mongoose.Schema(
  {
    senderRole: { type: String, enum: ['customer', 'vendor'], required: true },
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const leadRequestSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    customerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    eventDate: { type: Date },
    message: { type: String },
    status: { type: String, enum: LEAD_STATUS_LIST, default: LEAD_STATUS.NEW },
    messages: { type: [leadMessageSchema], default: [] },
    // Liste ekranlarında mesaj dizisini çekmeden rozet/önizleme gösterebilmek için.
    customerUnread: { type: Number, default: 0 },
    vendorUnread: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
  },
  { timestamps: true },
);

leadRequestSchema.index({ vendorId: 1, createdAt: -1 });

export const LeadRequest = mongoose.model('LeadRequest', leadRequestSchema);
