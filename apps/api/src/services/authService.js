import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ROLES } from '@repo/constants';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sendPasswordResetEmail } from './emailService.js';

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 saat

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function registerCustomer({ name, email, password, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Bu email zaten kayıtlı');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, phone, role: ROLES.CUSTOMER });
  return toSafeUser(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Email veya şifre hatalı');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Email veya şifre hatalı');
  }

  return { token: signToken(user), user: toSafeUser(user) };
}

// Email'in sistemde kayıtlı olup olmadığı hiçbir zaman farklı bir cevapla ele vermez
// (enumeration saldırısı önlenir) — kayıtlı değilse de aynı "gönderildi" cevabı döner.
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = hashToken(rawToken);
  user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  // Sıfırlama linki kullanıcının ait olduğu app'e gitmeli — admin/vendor'ı müşteri sitesine
  // değil kendi paneline yönlendiriyoruz.
  const baseUrl = user.role === 'admin' ? env.adminUrl : user.role === 'vendor' ? env.panelUrl : env.webUrl;
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() },
  }).select('+resetTokenHash +resetTokenExpires');

  if (!user) {
    throw new ApiError(400, 'Link geçersiz veya süresi dolmuş, yeniden şifre sıfırlama isteği gönderin');
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
}

export async function updateProfile(userId, data) {
  const user = await User.findByIdAndUpdate(userId, data, { new: true });
  if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı');
  return toSafeUser(user);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(400, 'Mevcut şifre hatalı');

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
}

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, vendorId: user.vendorId?.toString() },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function toSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    vendorId: user.vendorId,
  };
}
