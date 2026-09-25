export const LEAD_STATUS = Object.freeze({
  NEW: 'new',
  CONTACTED: 'contacted',
  BOOKED: 'booked',
  DECLINED: 'declined',
  // Eski kayıtlar için korunuyor — yeni akışta "booked"/"declined" kullanılır.
  CLOSED: 'closed',
});

export const LEAD_STATUS_LIST = Object.values(LEAD_STATUS);

// İşletmenin panelden seçebileceği durumlar — "new" sadece talep ilk geldiğinde atanır.
export const LEAD_STATUS_VENDOR_SETTABLE = Object.freeze([
  LEAD_STATUS.CONTACTED,
  LEAD_STATUS.BOOKED,
  LEAD_STATUS.DECLINED,
]);
