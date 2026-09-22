// Paylaşılan bileşen next-intl'e erişemez (bkz. VendorCard.jsx) — bu yüzden `label` çağıran
// app'ten çevrilmiş olarak geçirilmeli. Verilmezse Türkçe'ye kilitlenmemek için nötr,
// İngilizce bir varsayılana düşer.
export function Spinner({ size = 24, label }) {
  return (
    <div
      role="status"
      aria-label={label ?? 'Loading'}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) 0' }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2.5px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          animation: 'ui-spin 0.7s linear infinite',
          display: 'inline-block',
        }}
      />
      {label && <span style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)' }}>{label}</span>}
    </div>
  );
}
