import { VENDOR_STATUS } from '@repo/constants';
import { User, Vendor } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function addFavorite(userId, vendorId) {
  const vendor = await Vendor.findOne({ _id: vendorId, status: VENDOR_STATUS.APPROVED });
  if (!vendor) throw new ApiError(404, 'Vendor bulunamadı');
  await User.findByIdAndUpdate(userId, { $addToSet: { favorites: vendorId } });
}

export async function removeFavorite(userId, vendorId) {
  await User.findByIdAndUpdate(userId, { $pull: { favorites: vendorId } });
}

export async function listFavorites(userId) {
  const user = await User.findById(userId).populate('favorites');
  return (user?.favorites ?? []).filter((vendor) => vendor.status === VENDOR_STATUS.APPROVED);
}
