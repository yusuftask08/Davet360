// Teklif durumları — panelin teklif listesi ve detay sayfası aynı etiketleri kullanır.
export const LEAD_STATUS_LABEL = {
  new: { label: 'Yeni', tone: 'primary' },
  contacted: { label: 'Görüşülüyor', tone: 'warning' },
  booked: { label: 'Anlaşıldı', tone: 'success' },
  declined: { label: 'Olmadı', tone: 'neutral' },
  closed: { label: 'Kapandı', tone: 'neutral' },
};

// İşletmenin seçebileceği durumlar (API'deki LEAD_STATUS_VENDOR_SETTABLE ile aynı).
export const SETTABLE_STATUSES = ['contacted', 'booked', 'declined'];
