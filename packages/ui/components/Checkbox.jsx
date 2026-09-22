import { Check } from 'lucide-react';

// Seçilebilir "chip" görünümlü checkbox/radio — filtre panelleri için (olanaklar, sıralama).
// Gerçek <input> DOM'da kalır (erişilebilirlik/form submit), görsel olarak gizlenir; seçili
// hâli CSS :has() ile chip'in kendisine yansır, JS gerekmez. Checkbox (çoklu seçim) ve Radio
// (tekli seçim, ör. sıralama) aynı görsel bileşeni paylaşır, sadece input type'ı değişir.
function Chip({ type, label, className = '', ...props }) {
  return (
    <label className={`ui-chip ${className}`.trim()}>
      <input type={type} {...props} />
      <Check size={14} strokeWidth={3} className="ui-chip__check" aria-hidden="true" />
      {label}
    </label>
  );
}

export function Checkbox(props) {
  return <Chip type="checkbox" {...props} />;
}

export function Radio(props) {
  return <Chip type="radio" {...props} />;
}
