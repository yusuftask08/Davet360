import { Router } from 'express';
import { ROLES } from '@repo/constants';
import { createVendorSchema, updateVendorSchema } from '@repo/utils';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import {
  listApprovedVendors,
  listVendorCities,
  listPopularCombos,
  listFeaturedVendors,
  listTopCities,
  listCategoriesInCity,
  getApprovedVendorBySlug,
  createVendorApplication,
  updateOwnVendor,
} from '../services/vendorService.js';
import { listLeadsForVendor } from '../services/leadService.js';
import { Vendor } from '../models/index.js';

export const vendorRouter = Router();

vendorRouter.get('/', async (req, res, next) => {
  try {
    const { category, citySlug, search, maxBudget, minCapacity, page, limit } = req.query;
    const result = await listApprovedVendors({ category, citySlug, search, maxBudget, minCapacity, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

vendorRouter.post('/', requireAuth, validateBody(createVendorSchema), async (req, res, next) => {
  try {
    const vendor = await createVendorApplication(req.user.sub, req.body);
    res.status(201).json({ vendor });
  } catch (err) {
    next(err);
  }
});

// Tek segment'li route'lar '/:slug' ile çakışmasın diye ondan ÖNCE tanımlanır.
vendorRouter.get('/cities', async (req, res, next) => {
  try {
    const items = await listVendorCities(req.query.category);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

vendorRouter.get('/popular-combos', async (req, res, next) => {
  try {
    const items = await listPopularCombos(Number(req.query.limit) || 8);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

vendorRouter.get('/featured', async (req, res, next) => {
  try {
    const items = await listFeaturedVendors(Number(req.query.limit) || 6);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

vendorRouter.get('/top-cities', async (req, res, next) => {
  try {
    const items = await listTopCities(Number(req.query.limit) || 5);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

vendorRouter.get('/categories-in-city', async (req, res, next) => {
  try {
    const items = await listCategoriesInCity(req.query.citySlug, req.query.excludeCategory);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

vendorRouter.get('/:slug', async (req, res, next) => {
  try {
    const vendor = await getApprovedVendorBySlug(req.params.slug);
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

// Vendor sahibi kendi ilanını (statüsü ne olursa olsun) görüp düzenleyebilir.
vendorRouter.get('/:vendorId/own', requireAuth, async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.vendorId, ownerId: req.user.sub });
    if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

vendorRouter.put('/:vendorId', requireAuth, validateBody(updateVendorSchema), async (req, res, next) => {
  try {
    const vendor = await updateOwnVendor(req.params.vendorId, req.user.sub, req.body);
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
});

// Vendor sahibi ya da admin görebilir — RBAC burada sahiplik kontrolüyle birleşiyor.
vendorRouter.get('/:vendorId/leads', requireAuth, async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');

    const isOwner = vendor.ownerId.toString() === req.user.sub;
    const isAdmin = req.user.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) throw new ApiError(403, 'Bu işlem için yetkiniz yok');

    const leads = await listLeadsForVendor(vendor._id);
    res.json({ items: leads });
  } catch (err) {
    next(err);
  }
});
