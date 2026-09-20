import { Router } from 'express';
import { ROLES } from '@repo/constants';
import { createBlogPostSchema, updateBlogPostSchema, updateVendorSchema, updateUserSchema } from '@repo/utils';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import {
  listPendingVendors,
  listVendorsAdmin,
  getVendorByIdAdmin,
  updateVendorAdmin,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
} from '../services/vendorService.js';
import { approveReview, rejectReview, listPendingReviews, listReviewsAdmin, unpublishReview } from '../services/reviewService.js';
import { createPost, listAllPostsAdmin, getPostByIdAdmin, updatePost, unpublishPost } from '../services/blogService.js';
import { listUsersAdmin, setUserActive, setUserRole } from '../services/userService.js';
import { listLeadsAdmin } from '../services/leadService.js';
import { listAuditLog, recordAudit } from '../services/auditService.js';
import { getDashboardStats } from '../services/statsService.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole(ROLES.ADMIN));

// ---- Dashboard ----
adminRouter.get('/stats', async (req, res, next) => {
  try {
    res.json(await getDashboardStats());
  } catch (err) {
    next(err);
  }
});

// ---- Vendors ----
adminRouter.get('/vendors/pending', async (req, res, next) => {
  try {
    const items = await listPendingVendors();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/vendors', async (req, res, next) => {
  try {
    const { status, category, citySlug, search, page, limit } = req.query;
    const result = await listVendorsAdmin({ status, category, citySlug, search, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await getVendorByIdAdmin(req.params.id);
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/vendors/:id', validateBody(updateVendorSchema), async (req, res, next) => {
  try {
    const vendor = await updateVendorAdmin(req.params.id, req.body);
    await recordAudit({ adminId: req.user.sub, action: 'vendor.update', targetType: 'Vendor', targetId: vendor._id });
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/vendors/:id/approve', async (req, res, next) => {
  try {
    const vendor = await approveVendor(req.params.id, req.user.sub);
    await recordAudit({ adminId: req.user.sub, action: 'vendor.approve', targetType: 'Vendor', targetId: vendor._id });
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/vendors/:id/reject', async (req, res, next) => {
  try {
    const vendor = await rejectVendor(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'vendor.reject', targetType: 'Vendor', targetId: vendor._id });
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/vendors/:id/suspend', async (req, res, next) => {
  try {
    const vendor = await suspendVendor(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'vendor.suspend', targetType: 'Vendor', targetId: vendor._id });
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/vendors/:id/reactivate', async (req, res, next) => {
  try {
    const vendor = await reactivateVendor(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'vendor.reactivate', targetType: 'Vendor', targetId: vendor._id });
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

// ---- Reviews ----
adminRouter.get('/reviews/pending', async (req, res, next) => {
  try {
    const items = await listPendingReviews();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/reviews', async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    res.json(await listReviewsAdmin({ status, page, limit }));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/reviews/:id/approve', async (req, res, next) => {
  try {
    const review = await approveReview(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'review.approve', targetType: 'Review', targetId: review._id });
    res.json({ review });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/reviews/:id/reject', async (req, res, next) => {
  try {
    const review = await rejectReview(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'review.reject', targetType: 'Review', targetId: review._id });
    res.json({ review });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/reviews/:id/unpublish', async (req, res, next) => {
  try {
    const review = await unpublishReview(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'review.unpublish', targetType: 'Review', targetId: review._id });
    res.json({ review });
  } catch (err) {
    next(err);
  }
});

// ---- Blog ----
adminRouter.get('/blog', async (req, res, next) => {
  try {
    const items = await listAllPostsAdmin();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/blog/:id', async (req, res, next) => {
  try {
    const post = await getPostByIdAdmin(req.params.id);
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/blog', validateBody(createBlogPostSchema), async (req, res, next) => {
  try {
    const post = await createPost(req.user.sub, req.body);
    await recordAudit({ adminId: req.user.sub, action: 'blog.create', targetType: 'BlogPost', targetId: post._id });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/blog/:id', validateBody(updateBlogPostSchema), async (req, res, next) => {
  try {
    const post = await updatePost(req.params.id, req.body);
    await recordAudit({ adminId: req.user.sub, action: 'blog.update', targetType: 'BlogPost', targetId: post._id });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/blog/:id/unpublish', async (req, res, next) => {
  try {
    const post = await unpublishPost(req.params.id);
    await recordAudit({ adminId: req.user.sub, action: 'blog.unpublish', targetType: 'BlogPost', targetId: post._id });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// ---- Users ----
adminRouter.get('/users', async (req, res, next) => {
  try {
    const { role, search, page, limit } = req.query;
    res.json(await listUsersAdmin({ role, search, page, limit }));
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id', validateBody(updateUserSchema), async (req, res, next) => {
  try {
    let user;
    if (typeof req.body.isActive === 'boolean') {
      user = await setUserActive(req.params.id, req.body.isActive);
      await recordAudit({
        adminId: req.user.sub,
        action: req.body.isActive ? 'user.activate' : 'user.deactivate',
        targetType: 'User',
        targetId: user._id,
      });
    }
    if (req.body.role) {
      user = await setUserRole(req.params.id, req.body.role, req.user.sub);
      await recordAudit({
        adminId: req.user.sub,
        action: 'user.setRole',
        targetType: 'User',
        targetId: user._id,
        details: { role: req.body.role },
      });
    }
    if (!user) throw new ApiError(400, 'Değiştirilecek bir alan gönderilmedi');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ---- Leads (gözetim) ----
adminRouter.get('/leads', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    res.json(await listLeadsAdmin({ page, limit }));
  } catch (err) {
    next(err);
  }
});

// ---- Audit log ----
adminRouter.get('/audit-log', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    res.json(await listAuditLog({ page, limit }));
  } catch (err) {
    next(err);
  }
});
