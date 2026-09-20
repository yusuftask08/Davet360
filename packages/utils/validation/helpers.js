// zod safeParse sonucundan { alanAdi: 'ilk hata mesajı' } şeklinde düz bir obje üretir —
// hem apps/api'nin validate middleware'i hem frontend formları aynı şekle ihtiyaç duyar.
export function toFieldErrors(zodError) {
  const fieldErrors = zodError.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
  );
}
