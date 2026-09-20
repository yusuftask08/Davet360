import mongoose from 'mongoose';

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);
