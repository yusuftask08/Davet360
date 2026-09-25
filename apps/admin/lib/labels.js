import { CATEGORIES } from '@repo/constants';

// Veritabanındaki ham enum değerleri (approved, new, customer...) arayüzde doğrudan
// gösteriliyordu — admin ekranlarının hepsi etiketleri buradan alır.
const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylı',
  rejected: 'Reddedildi',
  suspended: 'Askıda',
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  closed: 'Kapandı',
};

const ROLE_LABELS = {
  customer: 'Müşteri',
  vendor: 'İşletme',
  admin: 'Admin',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
