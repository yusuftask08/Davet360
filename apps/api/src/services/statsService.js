import { REVIEW_STATUS } from '@repo/constants';
import { User, Vendor, LeadRequest, Review, BlogPost } from '../models/index.js';

export async function getDashboardStats() {
  const [totalUsers, vendorsByStatusRaw, totalLeads, pendingReviews, publishedPosts] = await Promise.all([
    User.countDocuments(),
    Vendor.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    LeadRequest.countDocuments(),
    Review.countDocuments({ status: REVIEW_STATUS.PENDING }),
    BlogPost.countDocuments({ publishedAt: { $ne: null } }),
  ]);

  const vendorsByStatus = Object.fromEntries(vendorsByStatusRaw.map((s) => [s._id, s.count]));

  return { totalUsers, vendorsByStatus, totalLeads, pendingReviews, publishedPosts };
}
