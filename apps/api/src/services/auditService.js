import { AdminAuditLog } from '../models/index.js';

// Her admin route'u kendi AdminAuditLog.create(...) çağrısını tekrar yazmasın diye (DRY).
export function recordAudit({ adminId, action, targetType, targetId, details }) {
  return AdminAuditLog.create({ adminId, action, targetType, targetId, details });
}

export async function listAuditLog({ page = 1, limit = 50 }) {
  const safeLimit = Math.min(Number(limit) || 50, 200);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    AdminAuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(safeLimit).populate('adminId', 'name email'),
    AdminAuditLog.countDocuments(),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}
