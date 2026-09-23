import { ROLE_LIST } from '@repo/constants';
import { escapeRegex } from '@repo/utils';
import { User } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function listUsersAdmin({ role, search, page = 1, limit = 20 }) {
  const filter = {};
  if (role && ROLE_LIST.includes(role)) filter.role = role;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    User.countDocuments(filter),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

export async function setUserActive(userId, isActive) {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-passwordHash');
  if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı');
  return user;
}

// Admin kendi rolünü kendi kendine değiştiremez — yanlışlıkla kendini yetkisiz bırakmasını önler.
export async function setUserRole(userId, role, requestingAdminId) {
  if (userId === requestingAdminId) {
    throw new ApiError(400, 'Kendi rolünüzü değiştiremezsiniz');
  }
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash');
  if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı');
  return user;
}
