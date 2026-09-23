import mongoose from 'mongoose';
import { REVIEW_STATUS, REVIEW_STATUS_LIST } from '@repo/constants';

const reviewSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    status: { type: String, enum: REVIEW_STATUS_LIST, default: REVIEW_STATUS.PENDING, index: true },
  },
  { timestamps: true },
);

reviewSchema.index({ vendorId: 1, userId: 1 }, { unique: true });
// Public vendor sayfasının onaylı yorumları çekmesi (vendorId+status birlikte) için —
// yukarıdaki unique index'te userId araya girdiği için bu sorguyu karşılamıyor.
reviewSchema.index({ vendorId: 1, status: 1 });

export const Review = mongoose.model('Review', reviewSchema);
