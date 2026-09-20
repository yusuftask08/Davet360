import mongoose from 'mongoose';
import { LEAD_STATUS, LEAD_STATUS_LIST } from '@repo/constants';

const leadRequestSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    customerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    eventDate: { type: Date },
    message: { type: String },
    status: { type: String, enum: LEAD_STATUS_LIST, default: LEAD_STATUS.NEW },
  },
  { timestamps: true },
);

leadRequestSchema.index({ vendorId: 1, createdAt: -1 });

export const LeadRequest = mongoose.model('LeadRequest', leadRequestSchema);
