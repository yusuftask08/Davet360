import mongoose from 'mongoose';
import { ROLE_LIST, ROLES } from '@repo/constants';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ROLE_LIST, default: ROLES.CUSTOMER },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    isActive: { type: Boolean, default: true },
    // Ham token asla DB'ye yazılmaz, sadece hash'i — token URL'de/e-postada sızsa bile
    // DB'den çalınan veriyle şifre sıfırlanamaz.
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
