import { REVIEW_STATUS, REVIEW_STATUS_LIST } from '@repo/constants';
import { Review, Vendor } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function createReview(userId, data) {
  const existing = await Review.findOne({ vendorId: data.vendorId, userId });
  if (existing) {
    throw new ApiError(409, 'Bu vendor için zaten bir yorumunuz var');
  }
  return Review.create({ ...data, userId, status: REVIEW_STATUS.PENDING });
}

export async function listApprovedReviews(vendorId) {
  // Sınırsız değil — popüler bir vendor binlerce yorum biriktirebilir, sayfa en güncel 100'ü
  // gösterir (tam sayfalama şimdilik kapsam dışı).
  return Review.find({ vendorId, status: REVIEW_STATUS.APPROVED })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'name');
}

// "Hesabım" sayfası — müşterinin şu ana kadar yazdığı tüm yorumlar (durumu ne olursa olsun).
export async function listMyReviews(userId) {
  return Review.find({ userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('vendorId', 'businessName slug category citySlug');
}

export async function listPendingReviews() {
  return Review.find({ status: REVIEW_STATUS.PENDING })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate('vendorId', 'businessName')
    .populate('userId', 'name');
}

export async function approveReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Yorum bulunamadı');

  review.status = REVIEW_STATUS.APPROVED;
  await review.save();
  await recalculateVendorRating(review.vendorId);
  return review;
}

export async function rejectReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Yorum bulunamadı');

  review.status = REVIEW_STATUS.REJECTED;
  await review.save();
  return review;
}

// Admin paneli — tüm durumlardaki yorumları görüntüler (moderasyon geçmişi/denetim için).
export async function listReviewsAdmin({ status, page = 1, limit = 20 }) {
  const filter = {};
  if (status && REVIEW_STATUS_LIST.includes(status)) filter.status = status;

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('vendorId', 'businessName slug')
      .populate('userId', 'name email'),
    Review.countDocuments(filter),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

// Daha önce onaylanmış bir yorumu sonradan yayından kaldırma — vendor'ın puanı yeniden hesaplanır.
export async function unpublishReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Yorum bulunamadı');

  review.status = REVIEW_STATUS.REJECTED;
  await review.save();
  await recalculateVendorRating(review.vendorId);
  return review;
}

export async function recalculateVendorRating(vendorId) {
  const stats = await Review.aggregate([
    { $match: { vendorId, status: REVIEW_STATUS.APPROVED } },
    { $group: { _id: '$vendorId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] ?? {};
  await Vendor.findByIdAndUpdate(vendorId, { avgRating: avg, reviewCount: count });
}
